use crate::domain::host::event::EventEmitter;
use crate::domain::host::models::Host;
use crate::domain::host::ssh_client::SshClient;
use crate::infrastructure::error::ApiError;
use russh::client::{Handle, KeyboardInteractiveAuthResponse, Msg};
use russh::keys::key::PrivateKeyWithHashAlg;
use russh::keys::{decode_secret_key, HashAlg};
use russh::{client, Channel};
use std::sync::Arc;

pub struct SessionManager {
    event_emitter: Arc<EventEmitter>,
    session: Option<Handle<SshClient>>,
    host: Host,
}

impl SessionManager {
    pub fn new(event_emitter: Arc<EventEmitter>, host: &Host) -> Self {
        Self {
            session: None,
            event_emitter,
            host: (*host).clone(),
        }
    }
}

impl SessionManager {
    pub async fn connect(&mut self, should_check_public_key: bool) -> Result<(), ApiError> {
        let config = Arc::new(client::Config {
            ..Default::default()
        });
        let ssh_client = SshClient::new(
            self.event_emitter.clone(),
            self.host.fingerprint.clone(),
            should_check_public_key,
        );
        if let Ok(session) = client::connect(
            config,
            format!("{}:{}", self.host.address, self.host.port),
            ssh_client.clone(),
        )
        .await
        {
            self.session = Some(session);
        } else {
            return Err(ApiError::SessionNotFound);
        }

        Ok(())
    }

    pub async fn try_authenticate_kbd_interactive(
        &mut self,
        username: &str,
        password: &Option<String>,
    ) -> Result<bool, ApiError> {
        self.connect(false).await?;

        if let Some(ref mut session) = self.session {
            let mut kbd_response = session
                .authenticate_keyboard_interactive_start(username, None)
                .await?;
            loop {
                let prompts = match kbd_response {
                    KeyboardInteractiveAuthResponse::Success => {
                        return Ok(true);
                    }
                    KeyboardInteractiveAuthResponse::Failure => {
                        return Ok(false);
                    }
                    KeyboardInteractiveAuthResponse::InfoRequest { ref prompts, .. } => prompts,
                };

                let mut responses: Vec<String> = vec![];
                for prompt in prompts {
                    if prompt.prompt == "Password: " {
                        if let Some(password) = password {
                            responses.push(password.to_string());
                        }
                    }
                }

                kbd_response = session
                    .authenticate_keyboard_interactive_respond(responses)
                    .await?;
            }
        }
        Ok(false)
    }

    pub async fn try_authenticate_password(
        &mut self,
        username: &str,
        password: &str,
    ) -> Result<bool, ApiError> {
        self.connect(false).await?;

        if let Some(ref mut session) = self.session {
            let auth_result = session.authenticate_password(username, password).await?;

            if auth_result {
                return Ok(true);
            }
        }
        Ok(false)
    }

    pub async fn try_authenticate_public_key(
        &mut self,
        username: &str,
        content: &str,
    ) -> Result<bool, ApiError> {
        self.connect(false).await?;

        if let Some(ref mut session) = self.session {
            let private_key = decode_secret_key(content, None)?;
            let auth_result = session
                .authenticate_publickey(
                    username,
                    PrivateKeyWithHashAlg::new(Arc::new(private_key), Some(HashAlg::Sha512))?,
                )
                .await?;

            if auth_result {
                return Ok(true);
            }
        }
        Ok(false)
    }

    pub async fn channel_open_session(&mut self) -> Result<Channel<Msg>, ApiError> {
        if let Some(ref mut session) = self.session {
            let channel = session.channel_open_session().await?;
            return Ok(channel);
        };
        Err(ApiError::SessionNotFound)
    }

    pub async fn channel_open_direct_tcpip(
        &mut self,
        host_to_connect: &str,
        port_to_connect: u32,
        originator_address: &str,
        originator_port: u32,
    ) -> Result<Channel<Msg>, ApiError> {
        if let Some(ref mut session) = self.session {
            let channel = session
                .channel_open_direct_tcpip(
                    host_to_connect,
                    port_to_connect,
                    originator_address,
                    originator_port,
                )
                .await?;
            return Ok(channel);
        }
        Err(ApiError::SessionNotFound)
    }
}
