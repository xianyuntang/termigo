use crate::domain::host::event::{Data, EventData};
use crate::domain::host::lib::Host;
use crate::domain::host::ssh::SshClient;
use crate::domain::identity::lib::Identity;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use log;
use russh::keys::decode_secret_key;
use russh::{client, ChannelMsg};
use serde_json::json;
use std::sync::Arc;
use tauri::{Emitter, Event, Listener, State, Window};
use tokio::io::AsyncWriteExt;
use tokio::runtime;
use tokio::sync::{mpsc, Mutex};
use tokio::task::JoinHandle;
use tokio_util::bytes::Bytes;
use tokio_util::sync::CancellationToken;

#[tauri::command]
pub async fn list_hosts(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_hosts called");

    let store = &mut state.lock().await.store;
    let hosts = store.get("hosts").unwrap_or(json!([]));

    Ok(Response::from_value(hosts))
}

#[tauri::command]
pub async fn add_host(
    state: State<'_, Mutex<AppData>>,
    label: Option<String>,
    address: String,
    port: u32,
    identity_id: String,
) -> Result<Response, ApiError> {
    log::debug!("add_host called");

    let store = &mut state.lock().await.store;

    let host = Host::new(label, address, port, identity_id);
    let mut hosts = serde_json::from_value::<Vec<Host>>(store.get("hosts").unwrap_or(json!([])))?;

    hosts.push(host);
    store.set("hosts", json!(hosts));

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn update_host(
    state: State<'_, Mutex<AppData>>,
    id: String,
    label: Option<String>,
    address: String,
    port: u32,
    identity_id: String,
) -> Result<Response, ApiError> {
    log::debug!("update_host called");

    let store = &mut state.lock().await.store;

    let mut hosts = serde_json::from_value::<Vec<Host>>(store.get("hosts").unwrap_or(json!([])))?;

    if let Some(host) = hosts.iter_mut().find(|host| host.id == id) {
        host.label = label;
        host.address = address;
        host.port = port;
        host.identity_id = identity_id
    } else {
        return Err(ApiError::NotFound {
            item: "identity".to_string(),
        });
    }

    store.set("hosts", json!(hosts));

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn delete_host(
    state: State<'_, Mutex<AppData>>,
    id: String,
) -> Result<Response, ApiError> {
    log::debug!("delete_host called");

    let store = &mut state.lock().await.store;

    let mut hosts = serde_json::from_value::<Vec<Host>>(store.get("hosts").unwrap_or(json!([])))?;
    if let Some(position) = hosts.iter().position(|host| host.id == id) {
        hosts.remove(position);
    } else {
        return Err(ApiError::NotFound {
            item: "identity".to_string(),
        });
    }

    store.set("hosts", json!(hosts));

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn start_terminal_stream(
    window: Window,
    state: State<'_, Mutex<AppData>>,
    host_id: &str,
    terminal_id: String,
) -> Result<Response, ApiError> {
    log::debug!("start_terminal_stream called");

    if state.lock().await.future_manager.exist(&terminal_id) {
        return Ok(Response::new_ok_message());
    }

    let (hosts, identities) = {
        let store = &mut state.lock().await.store;
        (
            serde_json::from_value::<Vec<Host>>(store.get("hosts").unwrap_or(json!([])))?,
            serde_json::from_value::<Vec<Identity>>(store.get("identities").unwrap_or(json!([])))?,
        )
    };

    let host = hosts.iter().find(|host| host.id == host_id).cloned();
    let identity = host.as_ref().and_then(|host| {
        identities
            .iter()
            .find(|id| id.id == host.identity_id)
            .cloned()
    });

    if let (Some(host), Some(identity)) = (host, identity) {
        let config = Arc::new(client::Config {
            ..Default::default()
        });

        let ssh_client = SshClient::new();

        let cancel_token = CancellationToken::new();
        let cloned_cancel_token = cancel_token.clone();

        let cloned_terminal_id = terminal_id.clone();
        let _handler: JoinHandle<Result<(), ApiError>> = tokio::spawn(async move {
            log::debug!("Trying to connect to {}:{}", &host.address, &host.port);

            let mut session = client::connect(
                config,
                format!("{}:{}", &host.address, &host.port),
                ssh_client,
            )
            .await?;

            if let Some(password) = &identity.password {
                log::debug!("Trying authenticate password");
                session
                    .authenticate_password(&identity.username, password)
                    .await?;
            } else if let Some(key) = &identity.key {
                log::debug!("Trying authenticate publickey");
                let key_pair = decode_secret_key(key, None)?;
                session
                    .authenticate_publickey(&identity.username, Arc::new(key_pair))
                    .await?;
            } else {
                return Err(ApiError::Custom {
                    message: "connection failed".to_string(),
                });
            }

            let mut channel = session.channel_open_session().await?;

            channel.request_pty(true, "xterm", 0, 0, 0, 0, &[]).await?;
            channel.request_shell(true).await?;

            let rt = runtime::Builder::new_multi_thread().enable_all().build()?;
            let (tx, mut rx) = mpsc::channel::<Data>(1024);

            let event_id = window.listen(&cloned_terminal_id, move |event: Event| {
                let event_data =
                    serde_json::from_str::<EventData>(event.payload()).expect("Invalid Event");
                let cloned_tx = tx.clone();

                tokio::task::block_in_place(|| {
                    let _ = rt.block_on(async move {
                        cloned_tx
                            .send(event_data.data)
                            .await
                            .map_err(|e| ApiError::Custom {
                                message: e.to_string(),
                            })?;
                        Ok::<(), ApiError>(())
                    });
                });
            });

            loop {
                tokio::select! {
                    Some(msg) = channel.wait() => {
                        if let ChannelMsg::Data { ref data } = msg {
                            window.emit_to("main",&cloned_terminal_id, json!(EventData {data:Data::Out(Bytes::from(data.to_vec()))}))?;
                        }
                    },
                    Some(data) = rx.recv() => {
                        match data {
                            Data::In(in_data) => {
                                channel.make_writer().write_all(&in_data.into_bytes()).await?
                            },
                            Data::Size(size_data) => {
                                channel.window_change(size_data.0,size_data.1,0,0).await?

                            },
                            _ => {}
                        };
                    },
                    _ = cloned_cancel_token.cancelled() =>{
                        window.unlisten(event_id)
                    }
                }
            }
        });

        {
            let future_manager = &mut state.lock().await.future_manager;
            future_manager.add(cancel_token, Some(terminal_id.clone()));
        }
        return Ok(Response::new_ok_message());
    }

    Err(ApiError::NotFound {
        item: format!("host {host_id}"),
    })
}
