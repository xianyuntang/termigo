use async_trait::async_trait;
use russh::client;
use russh::keys::key::PublicKey;
use serde::{Deserialize, Serialize};
use tokio_util::bytes::Bytes;

#[derive(Serialize, Deserialize, Debug)]
pub struct StdinEventData {
    pub key: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StdoutEventData {
    pub message: Bytes,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WindowChangeEventData {
    pub cols: u32,
    pub rows: u32,
}

pub struct SshClient {}

#[async_trait]
impl client::Handler for SshClient {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }
}
