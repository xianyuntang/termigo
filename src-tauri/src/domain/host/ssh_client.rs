use crate::domain::host::event::{Data, EventEmitter, StatusType};
use crate::infrastructure::error::ApiError;
use async_trait::async_trait;
use russh::client;
use russh::keys::HashAlg::Sha512;
use russh::keys::PublicKey;
use std::sync::Arc;

#[derive(Clone)]
pub struct SshClient {
    event_emitter: Arc<EventEmitter>,
    fingerprint: Option<String>,
}

impl SshClient {
    pub fn new(event_emitter: Arc<EventEmitter>, fingerprint: Option<String>) -> Self {
        Self {
            event_emitter,
            fingerprint,
        }
    }
}

impl SshClient {}

#[async_trait]
impl client::Handler for SshClient {
    type Error = ApiError;

    async fn check_server_key(
        &mut self,
        server_public_key: &PublicKey,
    ) -> Result<bool, Self::Error> {
        let fingerprint = server_public_key.fingerprint(Sha512).to_string();

        if let Some(fp) = &self.fingerprint {
            if fp == &fingerprint {
                self.event_emitter
                    .emit(Data::Status(StatusType::PublicKeyVerified))
                    .await?;
                Ok(true)
            } else {
                self.event_emitter
                    .emit(Data::Status(StatusType::NewPublicKeyFound(fingerprint)))
                    .await?;
                Ok(true)
            }
        } else {
            self.event_emitter
                .emit(Data::Status(StatusType::NewPublicKeyFound(fingerprint)))
                .await?;
            Ok(true)
        }
    }
}
