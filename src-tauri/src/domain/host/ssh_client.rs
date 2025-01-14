use crate::domain::host::event::{Data, EventEmitter, StatusType};
use crate::infrastructure::error::ApiError;
use async_trait::async_trait;
use russh::client::Handler;
use russh::keys::HashAlg::Sha512;
use russh::keys::PublicKey;
use std::sync::Arc;

#[derive(Clone)]
pub struct SshClient {
    event_emitter: Arc<EventEmitter>,
    pub fingerprint: Option<String>,
    should_check_public_key: bool,
}

impl SshClient {
    pub fn new(
        event_emitter: Arc<EventEmitter>,
        fingerprint: Option<String>,
        should_check_public_key: bool,
    ) -> Self {
        Self {
            event_emitter,
            fingerprint,
            should_check_public_key,
        }
    }
}

#[async_trait]
impl Handler for SshClient {
    type Error = ApiError;

    async fn check_server_key(
        &mut self,
        server_public_key: &PublicKey,
    ) -> Result<bool, Self::Error> {
        if !self.should_check_public_key {
            return Ok(true);
        }

        let fingerprint = server_public_key.fingerprint(Sha512).to_string();

        if let Some(fp) = &self.fingerprint {
            if fp == &fingerprint {
                self.event_emitter.emit(Data::TrustPublicKey(true)).await?;
                return Ok(true);
            }
        }

        self.event_emitter
            .emit_status(StatusType::NewPublicKeyFound(fingerprint.to_string()))
            .await?;

        Ok(true)
    }
}
