use crate::domain::host::event::{Data, EventData, StatusType};
use crate::domain::host::lib::Host;
use crate::domain::host::ssh::SshClient;
use crate::domain::identity::lib::Identity;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::error::ApiError::Russh;
use crate::infrastructure::response::Response;
use log;
use russh::keys::decode_secret_key;
use russh::{client, ChannelMsg, Error};
use serde_json::json;
use std::sync::Arc;
use std::time::Duration;
use tauri::{Emitter, Event, Listener, State, Window};
use tokio::io::AsyncWriteExt;
use tokio::sync::{mpsc, Mutex};
use tokio::task::JoinHandle;
use tokio::time::sleep;
use tokio_util::bytes::Bytes;
use tokio_util::sync::CancellationToken;

use super::lib::AuthType;

#[tauri::command]
pub async fn list_hosts(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_hosts called");

    let store = &mut state.lock().await.store;
    let hosts = store.get("hosts").unwrap_or(json!([]));

    Ok(Response::from_value(hosts))
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn add_host(
    state: State<'_, Mutex<AppData>>,
    label: Option<String>,
    address: String,
    port: u32,
    auth_type: AuthType,
    identity: Option<String>,
    username: Option<String>,
    password: Option<String>,
    public_key: Option<String>,
) -> Result<Response, ApiError> {
    log::debug!("add_host called");

    let store = &mut state.lock().await.store;

    let host = Host::new(
        label, address, port, auth_type, identity, username, password, public_key,
    );
    let mut hosts = serde_json::from_value::<Vec<Host>>(store.get("hosts").unwrap_or(json!([])))?;

    hosts.push(host.clone());
    store.set("hosts", json!(hosts));

    Ok(Response::from_value(json!(host)))
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn update_host(
    state: State<'_, Mutex<AppData>>,
    id: String,
    label: Option<String>,
    address: String,
    port: u32,
    auth_type: AuthType,
    identity: Option<String>,
    username: Option<String>,
    password: Option<String>,
    public_key: Option<String>,
) -> Result<Response, ApiError> {
    log::debug!("update_host called");

    let store = &mut state.lock().await.store;

    let mut hosts = serde_json::from_value::<Vec<Host>>(store.get("hosts").unwrap_or(json!([])))?;

    let host = if let Some(host) = hosts.iter_mut().find(|host| host.id == id) {
        host.label = label;
        host.address = address;
        host.port = port;
        host.auth_type = auth_type;
        host.identity = identity;
        host.username = username;
        host.password = password;
        host.public_key = public_key;

        Some(host.clone())
    } else {
        None
    };

    store.set("hosts", json!(hosts));

    if let Some(host) = host {
        Ok(Response::from_value(json!(host)))
    } else {
        Err(ApiError::NotFound {
            item: format!("hostId {}", id),
        })
    }
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
    host: String,
    terminal: String,
) -> Result<Response, ApiError> {
    log::debug!("start_terminal_stream called with terminalId {}", terminal);

    if state.lock().await.future_manager.exist(&terminal) {
        return Ok(Response::new_ok_message());
    }

    let (hosts, identities) = {
        let store = &mut state.lock().await.store;
        (
            serde_json::from_value::<Vec<Host>>(store.get("hosts").unwrap_or(json!([])))?,
            serde_json::from_value::<Vec<Identity>>(store.get("identities").unwrap_or(json!([])))?,
        )
    };

    let host = hosts
        .iter()
        .find(|h| h.id == host)
        .cloned()
        .ok_or(ApiError::NotFound { item: host })?;

    let identity = host.identity.and_then(|id| {
        identities
            .iter()
            .find(|identity| identity.id == id)
            .cloned()
    });
    let (username, password, public_key) = if host.auth_type == AuthType::Username {
        (
            host.username.clone(),
            host.password.clone(),
            host.public_key.clone(),
        )
    } else {
        (
            identity.as_ref().map(|identity| identity.username.clone()),
            identity
                .as_ref()
                .and_then(|identity| identity.password.clone()),
            identity
                .as_ref()
                .and_then(|identity| identity.public_key.clone()),
        )
    };

    let username = username.ok_or(ApiError::NotFound {
        item: "username".to_string(),
    })?;

    let config = Arc::new(client::Config {
        ..Default::default()
    });

    let ssh_client = SshClient::new();

    let cancel_token = CancellationToken::new();
    let cloned_cancel_token = cancel_token.clone();

    let cloned_terminal = terminal.clone();
    let _handler: JoinHandle<Result<(), ApiError>> = tokio::spawn(async move {
        sleep(Duration::from_secs(1)).await;
        log::debug!("Trying to connect to {}:{}", &host.address, &host.port);

        window.emit_to(
            "main",
            &cloned_terminal,
            json!(EventData {
                data: Data::Status(StatusType::Connecting)
            }),
        )?;

        let mut session = match client::connect(
            config,
            format!("{}:{}", &host.address, &host.port),
            ssh_client,
        )
        .await
        {
            Ok(session) => session,
            Err(_) => {
                window.emit_to(
                    "main",
                    &cloned_terminal,
                    json!(EventData {
                        data: Data::Status(StatusType::ConnectionTimeout)
                    }),
                )?;
                return Err(Russh(Error::ConnectionTimeout));
            }
        };

        if let Some(password) = password {
            log::debug!("Trying authenticate password");
            session.authenticate_password(username, password).await?;
        } else if let Some(public_key) = public_key {
            log::debug!("Trying authenticate public key");
            let key_pair = decode_secret_key(&public_key, None)?;
            session
                .authenticate_publickey(username, Arc::new(key_pair))
                .await?;
        } else {
            window.emit_to(
                "main",
                &cloned_terminal,
                json!(EventData {
                    data: Data::Status(StatusType::AuthFailed)
                }),
            )?;
            return Err(Russh(Error::NoAuthMethod));
        }

        window.emit_to(
            "main",
            &cloned_terminal,
            json!(EventData {
                data: Data::Status(StatusType::Connected)
            }),
        )?;

        let mut channel = session.channel_open_session().await?;

        channel.request_pty(true, "xterm", 0, 0, 0, 0, &[]).await?;
        channel.request_shell(true).await?;

        window.emit_to(
            "main",
            &cloned_terminal,
            json!(EventData {
                data: Data::Status(StatusType::ChannelOpened)
            }),
        )?;

        let (tx, mut rx) = mpsc::channel::<Data>(1024);

        let event_id = window.listen(&cloned_terminal, move |event: Event| {
            let event_data =
                serde_json::from_str::<EventData>(event.payload()).expect("Invalid Event");
            tx.try_send(event_data.data).unwrap();
        });

        window.emit_to(
            "main",
            &cloned_terminal,
            json!(EventData {
                data: Data::Status(StatusType::StartStreaming)
            }),
        )?;

        loop {
            tokio::select! {
                Some(msg) = channel.wait() => {
                    if let ChannelMsg::Data { ref data } = msg {
                        window.emit_to("main",&cloned_terminal, json!(EventData {data:Data::Out(Bytes::from(data.to_vec()))}))?;
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
                    window.unlisten(event_id);
                    return Ok(())
                }
            }
        }
    });

    {
        let future_manager = &mut state.lock().await.future_manager;
        future_manager.add(cancel_token, Some(terminal.clone()));
    }
    Ok(Response::new_ok_message())
}
