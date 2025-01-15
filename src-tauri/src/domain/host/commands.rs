use super::models::Credential;
use crate::domain::host::event::{AuthMethod, Data, EventData, EventEmitter, StatusType};
use crate::domain::host::models::Host;
use crate::domain::host::session_manager::SessionManager;
use crate::domain::store::r#enum::StoreKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use log;
use russh::client::Msg;
use russh::{Channel, ChannelMsg, Error};
use serde_json::json;
use std::sync::Arc;
use std::time::Duration;
use tauri::{Event, Listener, State, Window};
use tokio::io::{self, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::sync::{mpsc, Mutex};
use tokio::task::JoinHandle;
use tokio::time::sleep;
use tokio_util::bytes::Bytes;
use tokio_util::sync::CancellationToken;

#[tauri::command]
pub async fn list_hosts(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_hosts called");
    let store_manager = &state.lock().await.store_manager;

    let hosts = store_manager.get_data::<Vec<Host>>(StoreKey::Hosts)?;

    Ok(Response::from_data(hosts))
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn add_host(
    state: State<'_, Mutex<AppData>>,
    label: String,
    address: String,
    port: u32,
    credential: Credential,
) -> Result<Response, ApiError> {
    log::debug!("add_host called");
    let store_manager = &state.lock().await.store_manager;

    let host = Host::new(Some(label), address, port, credential, None);
    let mut hosts = store_manager.get_data::<Vec<Host>>(StoreKey::Hosts)?;

    hosts.push(host.clone());

    store_manager.update_data(StoreKey::Hosts, hosts)?;

    Ok(Response::from_value(json!(host)))
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn update_host(
    state: State<'_, Mutex<AppData>>,
    id: String,
    label: String,
    address: String,
    port: u32,
    credential: Credential,
) -> Result<Response, ApiError> {
    log::debug!("update_host called");

    let store_manager = &state.lock().await.store_manager;

    let mut hosts = store_manager.get_data::<Vec<Host>>(StoreKey::Hosts)?;

    let host = if let Some(host) = hosts.iter_mut().find(|host| host.id == id) {
        host.label = Some(label);
        host.address = address;
        host.port = port;
        host.credential = credential;
        host.clone()
    } else {
        return Err(ApiError::NotFound {
            item: format!("hostId {}", id),
        });
    };

    store_manager.update_data(StoreKey::Hosts, hosts)?;

    Ok(Response::from_data(host))
}

#[tauri::command]
pub async fn update_host_fingerprint(
    state: State<'_, Mutex<AppData>>,
    id: String,
    fingerprint: String,
) -> Result<Response, ApiError> {
    log::debug!("update_host_fingerprint called");

    let store_manager = &state.lock().await.store_manager;

    let mut hosts = store_manager.get_data::<Vec<Host>>(StoreKey::Hosts)?;

    if let Some(host) = hosts.iter_mut().find(|host| host.id == id) {
        host.fingerprint = Some(fingerprint);
    } else {
        return Err(ApiError::NotFound {
            item: format!("hostId {}", id),
        });
    }

    store_manager.update_data(StoreKey::Hosts, hosts)?;
    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn delete_host(
    state: State<'_, Mutex<AppData>>,
    id: String,
) -> Result<Response, ApiError> {
    log::debug!("delete_host called");

    let store_manager = &state.lock().await.store_manager;

    let mut hosts = store_manager.get_data::<Vec<Host>>(StoreKey::Hosts)?;

    if let Some(position) = hosts.iter().position(|host| host.id == id) {
        hosts.remove(position);
    } else {
        return Err(ApiError::NotFound {
            item: "identity".to_string(),
        });
    }

    store_manager.update_data(StoreKey::Hosts, hosts)?;

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn start_terminal_stream(
    window: Window,
    state: State<'_, Mutex<AppData>>,
    host_id: String,
    event_id: String,
) -> Result<Response, ApiError> {
    log::debug!("start_terminal_stream called");

    {
        let future_manager = &state.lock().await.future_manager;

        if future_manager.exist(&event_id) {
            return Ok(Response::new_ok_message());
        }
    }

    let (host, username, password, private_key_content) = {
        let store_manager = &state.lock().await.store_manager;

        let host = if let Some(host) = store_manager.get_item::<Host>(StoreKey::Hosts, &host_id)? {
            host
        } else {
            return Err(ApiError::NotFound { item: host_id });
        };
        let credentials = host.get_credential(store_manager)?;

        (host, credentials.0, credentials.1, credentials.2)
    };

    let (tx, mut rx) = mpsc::channel::<Data>(1024);

    let cloned_tx = tx.clone();
    let window_event_id = window.listen(&event_id, move |event: Event| {
        let event_data = serde_json::from_str::<EventData>(event.payload()).expect("Invalid Event");
        let _ = cloned_tx.try_send(event_data.data);
    });

    let cancel_token = CancellationToken::new();
    let cloned_cancel_token = cancel_token.clone();

    let event_emitter = Arc::new(EventEmitter::new(window.clone(), event_id.clone()));

    let mut session_manager = SessionManager::new(Arc::clone(&event_emitter), &host);

    let _handler: JoinHandle<Result<(), ApiError>> = tokio::spawn(async move {
        sleep(Duration::from_millis(100)).await;

        log::debug!("Trying to connect to {}:{}", &host.address, &host.port);
        event_emitter.emit_status(StatusType::Connecting).await?;

        if session_manager.connect(true).await.is_err() {
            event_emitter
                .emit_status(StatusType::ConnectionFailed)
                .await?;
            println!("23");
        }

        let mut channel: Option<Channel<Msg>> = None;

        loop {
            tokio::select! {
                maybe_msg = async {
                    if let Some(ref mut ch) = channel {
                        ch.wait().await
                    } else {
                        None
                    }
                }, if channel.is_some() => {
                    if let Some(ChannelMsg::Data { ref data }) = maybe_msg {
                        event_emitter.emit_out(Bytes::from(data.to_vec())).await?;
                    }
                },
                Some(data) = rx.recv() => {
                    match data {
                        Data::In(in_data) => {
                            if let Some(ref mut ch) = channel {
                                ch.make_writer().write_all(&in_data.into_bytes()).await?;
                            }

                        },
                        Data::Size(size_data) => {
                            if let Some(ref mut ch) = channel {
                                ch.window_change(size_data.0,size_data.1,0,0).await?
                            }
                        },
                        Data::TrustPublicKey(trust) => {
                            if !trust {
                                return Err(ApiError::Russh(Error::UnknownKey));
                            }
                            event_emitter
                                .emit_status(StatusType::SessionCreated)
                                .await?;

                        },
                        Data::Status(status_type) => {
                            match status_type {
                                StatusType::SessionCreated => {
                                    event_emitter.emit_status(StatusType::TryingToAuthenticate(AuthMethod::KeyboardInteractive)).await?;
                                    let mut auth_res = session_manager.try_authenticate_kbd_interactive(&username, &password).await?;

                                    if !auth_res {
                                        if let Some(ref password) = password {
                                            event_emitter.emit_status(StatusType::TryingToAuthenticate(AuthMethod::Password)).await?;
                                            auth_res = session_manager.try_authenticate_password(&username, password).await?;
                                        }
                                    }

                                    if !auth_res {
                                        if let Some(ref private_key_content) = private_key_content {
                                            event_emitter.emit_status(StatusType::TryingToAuthenticate(AuthMethod::PublicKey)).await?;
                                            auth_res = session_manager.try_authenticate_public_key(&username, private_key_content).await?;
                                        }
                                    }

                                    if auth_res {
                                        event_emitter.emit_status(StatusType::AuthSuccess).await?;
                                    }
                                    else {
                                        event_emitter.emit_status(StatusType::AuthFailed).await?;
                                    }

                                }
                                StatusType::AuthSuccess => {
                                    let new_channel = session_manager.channel_open_session().await?;
                                    event_emitter.emit_status(StatusType::ChannelOpened).await?;

                                    new_channel.request_pty(true, "xterm", 0, 0, 0, 0, &[]).await?;
                                    new_channel.request_shell(true).await?;
                                    event_emitter.emit_status(StatusType::StartStreaming).await?;
                                    channel = Some(new_channel);
                                }
                                _ => {}
                            }
                        }
                        _ => {}
                    };
                },
                _ = cloned_cancel_token.cancelled() => {
                    window.unlisten(window_event_id);
                    return Ok(())
                }
            }
        }
    });

    {
        let future_manager = &mut state.lock().await.future_manager;
        future_manager.add(cancel_token, Some(event_id.clone()));
    }
    Ok(Response::new_ok_message())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn start_tunnel_stream(
    window: Window,
    state: State<'_, Mutex<AppData>>,
    host_id: String,
    event_id: String,
    local_address: String,
    local_port: u32,
    destination_address: String,
    destination_port: u32,
) -> Result<Response, ApiError> {
    log::debug!("start_tunnel_stream called");

    {
        let future_manager = &state.lock().await.future_manager;
        if future_manager.exist(&event_id) {
            return Ok(Response::new_ok_message());
        }
    }

    let (host, username, password, private_key_content) = {
        let store_manager = &state.lock().await.store_manager;

        let host = if let Some(host) = store_manager.get_item::<Host>(StoreKey::Hosts, &host_id)? {
            host
        } else {
            return Err(ApiError::NotFound { item: host_id });
        };
        let credentials = host.get_credential(store_manager)?;

        (host, credentials.0, credentials.1, credentials.2)
    };

    let cancel_token = CancellationToken::new();
    let cloned_cancel_token = cancel_token.clone();

    let event_emitter = Arc::new(EventEmitter::new(window.clone(), event_id.clone()));

    let session_manager = Arc::new(Mutex::new(SessionManager::new(
        Arc::clone(&event_emitter),
        &host,
    )));

    let _handler: JoinHandle<Result<(), ApiError>> = tokio::spawn(async move {
        log::debug!("Trying to connect to {}:{}", &host.address, &host.port);
        event_emitter.emit_status(StatusType::Connecting).await?;
        session_manager.lock().await.connect(true).await?;

        event_emitter
            .emit_status(StatusType::TryingToAuthenticate(
                AuthMethod::KeyboardInteractive,
            ))
            .await?;

        let mut auth_res = session_manager
            .lock()
            .await
            .try_authenticate_kbd_interactive(&username, &password)
            .await?;

        if !auth_res {
            if let Some(ref password) = password {
                event_emitter
                    .emit_status(StatusType::TryingToAuthenticate(AuthMethod::Password))
                    .await?;
                auth_res = session_manager
                    .lock()
                    .await
                    .try_authenticate_password(&username, password)
                    .await?;
            }
        }

        if !auth_res {
            if let Some(ref private_key_content) = private_key_content {
                event_emitter
                    .emit_status(StatusType::TryingToAuthenticate(AuthMethod::PublicKey))
                    .await?;
                auth_res = session_manager
                    .lock()
                    .await
                    .try_authenticate_public_key(&username, private_key_content)
                    .await?;
            }
        }

        if auth_res {
            event_emitter.emit_status(StatusType::AuthSuccess).await?;
        } else {
            event_emitter.emit_status(StatusType::AuthFailed).await?;
        }

        let listener = TcpListener::bind(format!("{local_address}:{local_port}")).await?;

        loop {
            tokio::select! {
                incoming = listener.accept() => {
                    if let Ok((mut socket,_)) = incoming {
                        let cloned_session_manager = Arc::clone(&session_manager);
                        let cloned_destination_address = destination_address.clone();
                        let cloned_local_address = local_address.clone();
                        tokio::spawn(async move {
                            let channel = cloned_session_manager
                                .lock()
                                .await
                                .channel_open_direct_tcpip(
                                    &cloned_destination_address,
                                    destination_port,
                                    &cloned_local_address,
                                    local_port,
                                )
                                .await?;

                            let (mut ri, mut wi) = socket.split();
                            let stream = channel.into_stream();
                            let (mut rc, mut wc) = io::split(stream);

                            let client_to_remote = io::copy(&mut ri, &mut wc);
                            let remote_to_client = io::copy(&mut rc, &mut wi);

                            tokio::try_join!(client_to_remote, remote_to_client)?;

                            Ok::<(),ApiError>(())
                        });
                    }
                }
                _ = cloned_cancel_token.cancelled() =>{
                    return Ok(())
                }
            }
        }
    });

    {
        let future_manager = &mut state.lock().await.future_manager;
        future_manager.add(cancel_token, Some(event_id.clone()));
    }
    Ok(Response::new_ok_message())
}
