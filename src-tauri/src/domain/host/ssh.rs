use async_trait::async_trait;
use russh::client;
use russh::keys::key::PublicKey;

pub struct SshClient {}

impl SshClient {
    pub fn new() -> Self {
        Self {}
    }
}

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
