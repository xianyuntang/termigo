use nanoid::nanoid;
use serde::{Deserialize, Serialize};

use crate::domain::identity::models::Identity;
use crate::domain::private_key::models::PrivateKey;
use crate::domain::store::r#enum::StoreKey;
use crate::domain::store::store_manager::StoreManager;
use crate::domain::traits::Identifiable;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::transform::empty_to_null;

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
pub enum Credential {
    #[serde(rename = "local")]
    Local(LocalAuth),
    #[serde(rename = "identity")]
    Identity(String),
}

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LocalAuth {
    pub username: String,
    #[serde(serialize_with = "empty_to_null")]
    pub password: Option<String>,
    #[serde(serialize_with = "empty_to_null")]
    pub private_key_ref: Option<String>,
    // #[serde(serialize_with = "empty_to_null")]
    // pub challenges
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Host {
    pub id: String,
    #[serde(serialize_with = "empty_to_null")]
    pub label: Option<String>,
    pub address: String,
    pub port: u32,
    pub credential: Credential,
    #[serde(serialize_with = "empty_to_null")]
    pub fingerprint: Option<String>,
}

impl Host {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        label: Option<String>,
        address: String,
        port: u32,
        credential: Credential,
        fingerprint: Option<String>,
    ) -> Self {
        Self {
            id: nanoid!(),
            label,
            address,
            port,
            credential,
            fingerprint,
        }
    }
}

impl Host {
    pub fn get_credential(
        &self,
        store_manager: &StoreManager,
    ) -> Result<(String, Option<String>, Option<String>), ApiError> {
        match &self.credential {
            Credential::Local(local_auth) => {
                let private_key_content =
                    if let Some(ref private_key_ref) = local_auth.private_key_ref {
                        let private_key = store_manager
                            .get_item::<PrivateKey>(StoreKey::PrivateKeys, private_key_ref)?;
                        if let Some(private_key) = private_key {
                            Some(private_key.content.clone())
                        } else {
                            None
                        }
                    } else {
                        None
                    };

                Ok((
                    local_auth.username.clone(),
                    local_auth.password.clone(),
                    private_key_content,
                ))
            }
            Credential::Identity(identity_ref) => {
                let identity = if let Some(identity) =
                    store_manager.get_item::<Identity>(StoreKey::Identities, identity_ref)?
                {
                    identity
                } else {
                    return Err(ApiError::NotFound {
                        item: identity_ref.to_string(),
                    });
                };

                let private_key_content =
                    if let Some(ref private_key_ref) = identity.private_key_ref {
                        let private_key = store_manager
                            .get_item::<PrivateKey>(StoreKey::PrivateKeys, private_key_ref)?;
                        if let Some(private_key) = private_key {
                            Some(private_key.content)
                        } else {
                            None
                        }
                    } else {
                        None
                    };

                Ok((identity.username, identity.password, private_key_content))
            }
        }
    }
}

impl Identifiable for Host {
    fn id(&self) -> &str {
        &self.id
    }
}
