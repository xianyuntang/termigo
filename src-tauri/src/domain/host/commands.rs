use crate::domain::host::lib::Host;
use crate::domain::host::terminal::{
    SshClient, StdinEventData, StdoutEventData, WindowChangeEventData,
};
use crate::domain::identity::lib::Identity;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use log;
use russh::keys::decode_secret_key;
use russh::{client, ChannelMsg};
use serde_json::json;
use std::sync::Arc;
use tauri::{Emitter, Listener, State, Window};
use tokio::io::duplex;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::{mpsc, Mutex};
use tokio_util::bytes::Bytes;

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

    {
        let future_manager = &mut state.lock().await.future_manager;
        if future_manager.exist(&terminal_id) {
            return Ok(Response::new_ok_message());
        }
    }

    let hosts: Vec<Host>;
    let identities: Vec<Identity>;
    {
        let store = &mut state.lock().await.store;
        hosts = serde_json::from_value::<Vec<Host>>(store.get("hosts").unwrap_or(json!([])))?;
        identities =
            serde_json::from_value::<Vec<Identity>>(store.get("identities").unwrap_or(json!([])))?;
    }

    if let Some(host) = hosts.iter().find(|host| host.id == host_id).cloned() {
        if let Some(identity) = identities
            .iter()
            .find(|identity| identity.id == host.identity_id)
            .cloned()
        {
            let config = Arc::new(client::Config {
                ..Default::default()
            });

            let sh = SshClient {};
            let future_id = terminal_id.clone();
            let cloned_future_id = future_id.clone();

            let handler = tokio::spawn(async move {
                log::debug!("Trying to connect to {}:{}", &host.address, &host.port);
                let mut session =
                    client::connect(config, format!("{}:{}", &host.address, &host.port), sh)
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

                let (mut reader, writer) = duplex(1024);

                let writer = Arc::new(Mutex::new(writer));
                let mut buf = vec![0; 1024];
                let mut stdin_closed = false;

                window.listen(format!("{cloned_future_id}_in"), move |event| {
                    let cloned_writer = Arc::clone(&writer);
                    tokio::spawn(async move {
                        let event_data = serde_json::from_str::<StdinEventData>(event.payload())?;
                        cloned_writer
                            .lock()
                            .await
                            .write_all(&event_data.key.into_bytes())
                            .await?;

                        Ok::<(), ApiError>(())
                    });
                });

                let (tx, mut rx) = mpsc::channel(1024);
                let cloned_tx = tx.clone();

                window.listen(format!("{cloned_future_id}_resize"), move |event| {
                    let cloned_tx = cloned_tx.clone();
                    tokio::spawn(async move {
                        let event_data =
                            serde_json::from_str::<WindowChangeEventData>(event.payload())?;
                        cloned_tx
                            .send(event_data)
                            .await
                            .map_err(|e| ApiError::Custom {
                                message: e.to_string(),
                            })?;
                        Ok::<(), ApiError>(())
                    });
                });

                loop {
                    tokio::select! {
                        res = reader.read(&mut buf), if !stdin_closed => {
                            match res {
                                Ok(0) => {
                                    stdin_closed = true;
                                    channel.eof().await?;
                                },
                                Ok(n) => {
                                    channel.data(&buf[..n]).await?;
                                },
                                Err(e) => return Err(e.into()),
                            };
                        },
                        Some(msg) = channel.wait() => {
                            if let ChannelMsg::Data { ref data } = msg {
                                window.emit_to("main", &format!("{cloned_future_id}_out"), json!(StdoutEventData{message:Bytes::from(data.to_vec())}) )?
                            }

                        },
                        Some(window_event_data) = rx.recv() =>{
                            channel.window_change(window_event_data.cols,window_event_data.rows,0,0).await?
                        }
                    }
                }
            });

            {
                let future_manager = &mut state.lock().await.future_manager;
                future_manager.add(handler, Some(future_id.clone()));
            }
            return Ok(Response::new_ok_message());
        }
    }

    Err(ApiError::NotFound {
        item: format!("host {host_id}"),
    })
}
