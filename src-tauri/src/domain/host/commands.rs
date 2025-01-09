use crate::domain::host::event::{Data, EventData, StatusType};
use crate::domain::host::models::Host;
use crate::domain::host::session::get_session_credential;
use crate::domain::host::ssh::SshClient;

use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use crate::infrastructure::transform::convert_empty_to_option;

use log;

use russh::keys::{decode_secret_key, key::PrivateKeyWithHashAlg, HashAlg};

use super::models::AuthType;
use crate::domain::store::StoreKey;
use russh::{client, ChannelMsg, Error};
use serde_json::json;
use std::sync::Arc;
use tauri::{Emitter, Event, Listener, State, Window};
use tokio::io::{self, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::sync::{mpsc, Mutex};
use tokio::task::JoinHandle;
use tokio_util::bytes::Bytes;
use tokio_util::sync::CancellationToken;

#[tauri::command]
pub async fn list_hosts(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_hosts called");

    let store = &mut state.lock().await.store;
    let hosts = store.get(StoreKey::Hosts.as_str()).unwrap_or(json!([]));

    Ok(Response::from_value(hosts))
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn add_host(
    state: State<'_, Mutex<AppData>>,
    label: String,
    address: String,
    port: u32,
    auth_type: AuthType,
    identity: String,
    username: String,
    password: String,
    private_key: String,
) -> Result<Response, ApiError> {
    log::debug!("add_host called");

    let store = &mut state.lock().await.store;

    let host = Host::new(
        convert_empty_to_option(label),
        address,
        port,
        auth_type,
        convert_empty_to_option(identity),
        convert_empty_to_option(username),
        convert_empty_to_option(password),
        convert_empty_to_option(private_key),
    );
    let mut hosts = serde_json::from_value::<Vec<Host>>(
        store.get(StoreKey::Hosts.as_str()).unwrap_or(json!([])),
    )?;

    hosts.push(host.clone());
    store.set(StoreKey::Hosts.as_str(), json!(hosts));

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
    auth_type: AuthType,
    identity: String,
    username: String,
    password: String,
    private_key: String,
) -> Result<Response, ApiError> {
    log::debug!("update_host called");

    let store = &mut state.lock().await.store;

    let mut hosts = serde_json::from_value::<Vec<Host>>(
        store.get(StoreKey::Hosts.as_str()).unwrap_or(json!([])),
    )?;

    let host = if let Some(host) = hosts.iter_mut().find(|host| host.id == id) {
        host.label = convert_empty_to_option(label);
        host.address = address;
        host.port = port;
        host.auth_type = auth_type;
        host.identity = convert_empty_to_option(identity);
        host.username = convert_empty_to_option(username);
        host.password = convert_empty_to_option(password);
        host.private_key = convert_empty_to_option(private_key);

        Some(host.clone())
    } else {
        None
    };

    store.set(StoreKey::Hosts.as_str(), json!(hosts));

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

    let mut hosts = serde_json::from_value::<Vec<Host>>(
        store.get(StoreKey::Hosts.as_str()).unwrap_or(json!([])),
    )?;
    if let Some(position) = hosts.iter().position(|host| host.id == id) {
        hosts.remove(position);
    } else {
        return Err(ApiError::NotFound {
            item: "identity".to_string(),
        });
    }

    store.set(StoreKey::Hosts.as_str(), json!(hosts));

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn start_terminal_stream(
    window: Window,
    state: State<'_, Mutex<AppData>>,
    host: String,
    terminal: String,
) -> Result<Response, ApiError> {
    log::debug!("start_terminal_stream called");

    if state.lock().await.future_manager.exist(&terminal) {
        return Ok(Response::new_ok_message());
    }

    let (host, username, password, private_key) = get_session_credential(&state, host).await?;

    let cancel_token = CancellationToken::new();
    let cloned_cancel_token = cancel_token.clone();

    let cloned_terminal = terminal.clone();
    let _handler: JoinHandle<Result<(), ApiError>> = tokio::spawn(async move {
        log::debug!("Trying to connect to {}:{}", &host.address, &host.port);

        let config = Arc::new(client::Config {
            ..Default::default()
        });

        let ssh_client = SshClient::new();

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
                return Err(ApiError::Russh(Error::ConnectionTimeout));
            }
        };
        let mut auth_res = false;

        if let Some(password) = password {
            log::debug!("Trying authenticate password");
            auth_res = session.authenticate_password(username, password).await?;
        } else if let Some(content) = private_key {
            log::debug!("Trying authenticate public key");

            let private_key = decode_secret_key(&content, None)?;

            auth_res = session
                .authenticate_publickey(
                    username,
                    PrivateKeyWithHashAlg::new(Arc::new(private_key), Some(HashAlg::Sha512))?,
                )
                .await?;
        }

        if !auth_res {
            window.emit_to(
                "main",
                &cloned_terminal,
                json!(EventData {
                    data: Data::Status(StatusType::AuthFailed)
                }),
            )?;
            return Err(ApiError::Russh(Error::NoAuthMethod));
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

        let cloned_tx = tx.clone();
        let event_id = window.listen(&cloned_terminal, move |event: Event| {
            let event_data =
                serde_json::from_str::<EventData>(event.payload()).expect("Invalid Event");
            cloned_tx.try_send(event_data.data).unwrap();
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
                            channel.make_writer().write_all(&in_data.into_bytes()).await?;
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

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn start_tunnel_stream(
    window: Window,
    state: State<'_, Mutex<AppData>>,
    host: String,
    tunnel: String,
    local_address: String,
    local_port: u32,
    destination_address: String,
    destination_port: u32,
) -> Result<Response, ApiError> {
    log::debug!("start_tunnel_stream called");

    if state.lock().await.future_manager.exist(&tunnel) {
        return Ok(Response::new_ok_message());
    }

    let (host, username, password, private_key) = get_session_credential(&state, host).await?;

    let cancel_token = CancellationToken::new();
    let cloned_cancel_token = cancel_token.clone();

    let cloned_tunnel = tunnel.clone();
    let _handler: JoinHandle<Result<(), ApiError>> = tokio::spawn(async move {
        log::debug!("Trying to connect to {}:{}", &host.address, &host.port);

        let config = Arc::new(client::Config {
            ..Default::default()
        });

        let ssh_client = SshClient::new();

        window.emit_to(
            "main",
            &cloned_tunnel,
            json!(EventData {
                data: Data::Status(StatusType::Connecting)
            }),
        )?;

        let session = match client::connect(
            config,
            format!("{}:{}", &host.address, &host.port),
            ssh_client,
        )
        .await
        {
            Ok(session) => Arc::new(Mutex::new(session)),
            Err(_) => {
                window.emit_to(
                    "main",
                    &cloned_tunnel,
                    json!(EventData {
                        data: Data::Status(StatusType::ConnectionTimeout)
                    }),
                )?;
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
        } else if let Some(private_key) = private_key {
            log::debug!("Trying authenticate private key");
            let key_pair = decode_secret_key(&private_key, None)?;
            auth_res = session
                .lock()
                .await
                .authenticate_publickey(
                    username,
                    PrivateKeyWithHashAlg::new(Arc::new(key_pair), Some(HashAlg::Sha512))?,
                )
                .await?;
        }

        if !auth_res {
            window.emit_to(
                "main",
                &cloned_tunnel,
                json!(EventData {
                    data: Data::Status(StatusType::AuthFailed)
                }),
            )?;
            return Err(ApiError::Russh(Error::NoAuthMethod));
        }

        window.emit_to(
            "main",
            &cloned_tunnel,
            json!(EventData {
                data: Data::Status(StatusType::Connected)
            }),
        )?;

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
        future_manager.add(cancel_token, Some(tunnel.clone()));
    }
    Ok(Response::new_ok_message())
}
