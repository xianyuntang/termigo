use crate::domain::host::terminal::{StdinEventData, StdoutEventData, WindowChangeEventData};
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use async_trait::async_trait;
use log;
use nanoid::nanoid;
use russh::keys::key::PublicKey;
use russh::keys::{load_public_key, load_secret_key};
use russh::{client, ChannelMsg};
use serde_json::json;
use std::ptr::write;
use std::sync::mpsc::channel;
use std::sync::Arc;
use tauri::{Emitter, Listener, State, Window};
use tokio::io::duplex;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::{mpsc, Mutex};
use tokio_util::bytes::Bytes;

struct Client {}

#[async_trait]
impl client::Handler for Client {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }
}

#[tauri::command]
pub async fn start_terminal_stream(
    window: Window,
    state: State<'_, Mutex<AppData>>,
    host_id: &str,
) -> Result<Response, ApiError> {
    log::debug!("start_terminal_stream called");

    let future_manager = &mut state.lock().await.future_manager;

    let config = client::Config {
        ..Default::default()
    };

    let config = Arc::new(config);

    let sh = Client {};
    let addr = "127.0.0.1:2222";
    let username = "root";

    let future_id = nanoid!();
    let cloned_future_id = future_id.clone();

    let handler = tokio::spawn(async move {
        let mut session = client::connect(config, addr, sh).await?;

        session.authenticate_password(username, "root").await?;

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
                let event_data = serde_json::from_str::<WindowChangeEventData>(event.payload())?;
                cloned_tx
                    .send(event_data)
                    .await
                    .map_err(|e| ApiError::CustomError {
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
                    match msg {
                        ChannelMsg::Data { ref data } => {
                            window.emit_to("main", &format!("{cloned_future_id}_out"), json!(StdoutEventData{message:Bytes::from(data.to_vec())}) )?
                        }
                        _ => {}
                    }
                },
                Some(window_event_data) = rx.recv() =>{
                    channel.window_change(window_event_data.cols,window_event_data.rows,0,0).await?
                }
            }
        }
        Ok::<_, ApiError>(())
    });

    future_manager.add(handler, Some(future_id.clone()));

    Ok(Response {
        data: json!({"futureId":future_id}),
    })
}
