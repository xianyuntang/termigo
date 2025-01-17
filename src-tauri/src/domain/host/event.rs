use crate::infrastructure::error::ApiError;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{Emitter, Window};
use tokio_util::bytes::Bytes;

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "data", rename_all = "PascalCase")]
pub enum AuthMethod {
    Password,
    PublicKey,
    KeyboardInteractive,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "data", rename_all = "PascalCase")]
pub enum StatusType {
    Pending,
    Connecting,
    SessionCreated,
    TryingToAuthenticate(AuthMethod),
    AuthSuccess,
    AuthFailed,
    ChannelOpened,
    StartStreaming,
    NewPublicKeyFound(String),
    ConnectionFailed,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum EvenType {
    In,
    Out,
    WindowChange,
    Status,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Data {
    In(String),
    Out(Bytes),
    Size((u32, u32)),
    Status(StatusType),
    TrustPublicKey(bool),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EventData {
    pub data: Data,
}

#[derive(Clone)]
pub struct EventEmitter {
    window: Window,
    channel: String,
}

impl EventEmitter {
    pub fn new(window: Window, channel: String) -> Self {
        Self { window, channel }
    }
}

impl EventEmitter {
    pub async fn emit(&self, data: Data) -> Result<(), ApiError> {
        Ok(self
            .window
            .emit_to("main", &self.channel, json!(EventData { data }))?)
    }

    pub async fn emit_status(&self, status_type: StatusType) -> Result<(), ApiError> {
        self.emit(Data::Status(status_type)).await
    }

    pub async fn emit_out(&self, bytes: Bytes) -> Result<(), ApiError> {
        self.emit(Data::Out(bytes)).await
    }
}
