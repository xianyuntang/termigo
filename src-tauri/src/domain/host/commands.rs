use crate::domain::host::event::{Data, EventData, EventEmitter, StatusType};
use crate::domain::host::models::Host;
use crate::domain::host::ssh_client::SshClient;
use crate::domain::store::r#enum::StoreKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use log;
use russh::client::Msg;
use russh::keys::{decode_secret_key, key::PrivateKeyWithHashAlg, HashAlg};
use russh::{client, Channel, ChannelMsg, Error};
use serde_json::json;
use std::sync::Arc;
use tauri::{Event, Listener, State, Window};
use tokio::io::{self, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::sync::{mpsc, Mutex};
use tokio::task::JoinHandle;
use tokio_util::bytes::Bytes;
use tokio_util::sync::CancellationToken;

use super::models::AuthMethod;

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
    auth_method: AuthMethod,
) -> Result<Response, ApiError> {
    log::debug!("add_host called");
    let store_manager = &state.lock().await.store_manager;

    let host = Host::new(Some(label), address, port, auth_method, None);
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
    auth_method: AuthMethod,
) -> Result<Response, ApiError> {
    log::debug!("update_host called");

    let store_manager = &state.lock().await.store_manager;

    let mut hosts = store_manager.get_data::<Vec<Host>>(StoreKey::Hosts)?;

    let host = if let Some(host) = hosts.iter_mut().find(|host| host.id == id) {
        host.label = Some(label);
        host.address = address;
        host.port = port;
        host.auth_method = auth_method;
        host
    } else {
        return Err(ApiError::NotFound {
            item: format!("hostId {}", id),
        });
    };

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

    let event_emitter = Arc::new(EventEmitter::new(window.clone(), event_id.clone()));

    let (tx, mut rx) = mpsc::channel::<Data>(1024);

    let cloned_tx = tx.clone();
    let window_event_id = window.listen(&event_id, move |event: Event| {
        let event_data = serde_json::from_str::<EventData>(event.payload()).expect("Invalid Event");
        let _ = cloned_tx.try_send(event_data.data);
    });

    let cancel_token = CancellationToken::new();
    let cloned_cancel_token = cancel_token.clone();

    let config = Arc::new(client::Config {
        ..Default::default()
    });

    event_emitter
        .emit(Data::Status(StatusType::Connecting))
        .await?;

    let ssh_client = SshClient::new(Arc::clone(&event_emitter), host.fingerprint);

    let mut session = client::connect(
        config,
        format!("{}:{}", &host.address, &host.port),
        ssh_client,
    )
    .await?;

    let _handler: JoinHandle<Result<(), ApiError>> = tokio::spawn(async move {
        log::debug!("Trying to connect to {}:{}", &host.address, &host.port);

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
                        event_emitter.emit(Data::Out(Bytes::from(data.to_vec()))).await?;
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
                        Data::Confirm(confirm) =>{
                            if !confirm {
                                return Err(ApiError::Russh(Error::UnknownKey));
                            }

                            let mut auth_res = false;

                            if let Some(ref password) = password {
                                log::debug!("Trying authenticate password");
                                auth_res = session.authenticate_password(&username, password).await?;
                            } else if let Some(ref content) = private_key_content.clone() {
                                log::debug!("Trying authenticate public key");

                                let private_key = decode_secret_key(content, None)?;

                                auth_res = session
                                    .authenticate_publickey(
                                        &username,
                                        PrivateKeyWithHashAlg::new(
                                            Arc::new(private_key),
                                            Some(HashAlg::Sha512),
                                        )?,
                                    )
                                    .await?;
                            }

                            if !auth_res {
                                event_emitter
                                    .emit(Data::Status(StatusType::AuthFailed))
                                    .await?;
                                return Err(ApiError::Russh(Error::NoAuthMethod));
                            }

                            event_emitter
                                .emit(Data::Status(StatusType::Connected))
                                .await?;

                                let new_channel = session.channel_open_session().await?;

                                event_emitter
                                .emit(Data::Status(StatusType::ChannelOpened))
                                .await?;

                                new_channel.request_pty(true, "xterm", 0, 0, 0, 0, &[]).await?;
                                new_channel.request_shell(true).await?;


                                event_emitter
                                .emit(Data::Status(StatusType::StartStreaming))
                                .await?;

                                channel = Some(new_channel);


                        }
                        _ => {}
                    };
                },
                _ = cloned_cancel_token.cancelled() =>{
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

    let _handler: JoinHandle<Result<(), ApiError>> = tokio::spawn(async move {
        log::debug!("Trying to connect to {}:{}", &host.address, &host.port);

        let config = Arc::new(client::Config {
            ..Default::default()
        });

        event_emitter
            .emit(Data::Status(StatusType::Connecting))
            .await?;

        let ssh_client = SshClient::new(Arc::clone(&event_emitter), host.fingerprint);

        let session = match client::connect(
            config,
            format!("{}:{}", &host.address, &host.port),
            ssh_client,
        )
        .await
        {
            Ok(session) => Arc::new(Mutex::new(session)),
            Err(_) => {
                event_emitter
                    .emit(Data::Status(StatusType::ConnectionTimeout))
                    .await?;
                return Err(ApiError::Russh(Error::ConnectionTimeout));
            }
        };
        let mut auth_res = false;

        if let Some(password) = password {
            log::debug!("Trying authenticate password");
            auth_res = session
                .lock()
                .await
                .authenticate_password(username, password)
                .await?;
        } else if let Some(content) = private_key_content {
            log::debug!("Trying authenticate public key");

            let private_key = decode_secret_key(&content, None)?;

            auth_res = session
                .lock()
                .await
                .authenticate_publickey(
                    username,
                    PrivateKeyWithHashAlg::new(Arc::new(private_key), Some(HashAlg::Sha512))?,
                )
                .await?;
        }

        if !auth_res {
            event_emitter
                .emit(Data::Status(StatusType::AuthFailed))
                .await?;
            return Err(ApiError::Russh(Error::NoAuthMethod));
        }

        if !auth_res {
            event_emitter
                .emit(Data::Status(StatusType::AuthFailed))
                .await?;
            return Err(ApiError::Russh(Error::NoAuthMethod));
        }

        event_emitter
            .emit(Data::Status(StatusType::Connected))
            .await?;

        let listener = TcpListener::bind(format!("{local_address}:{local_port}")).await?;

        loop {
            tokio::select! {
                incoming = listener.accept() => {
                    if let Ok((mut socket,_)) = incoming {
                        let cloned_session = Arc::clone(&session);
                        let cloned_destination_address = destination_address.clone();
                        let cloned_local_address = local_address.clone();
                        tokio::spawn(async move {
                            let channel = cloned_session
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
