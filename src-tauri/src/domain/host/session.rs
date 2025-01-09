use serde_json::json;
use tauri::State;
use tokio::sync::Mutex;

use super::models::{AuthType, Host};
use crate::domain::store::StoreKey;
use crate::{
    domain::{identity::models::Identity, private_key::models::PrivateKey},
    infrastructure::{app::AppData, error::ApiError},
};

pub async fn get_session_credential(
    state: &State<'_, Mutex<AppData>>,
    host: String,
) -> Result<(Host, String, Option<String>, Option<String>), ApiError> {
    let (hosts, identities, private_keys) = {
        let store = &mut state.lock().await.store;
        (
            serde_json::from_value::<Vec<Host>>(
                store.get(StoreKey::Hosts.as_str()).unwrap_or(json!([])),
            )?,
            serde_json::from_value::<Vec<Identity>>(
                store
                    .get(StoreKey::Identities.as_str())
                    .unwrap_or(json!([])),
            )?,
            serde_json::from_value::<Vec<PrivateKey>>(
                store
                    .get(StoreKey::PrivateKeys.as_str())
                    .unwrap_or(json!([])),
            )?,
        )
    };

    let host = hosts
        .iter()
        .find(|h| h.id == host)
        .cloned()
        .ok_or(ApiError::NotFound { item: host })?;

    let cloned_host = host.clone();
    let identity = cloned_host.identity.and_then(|id| {
        identities
            .iter()
            .find(|identity| identity.id == id)
            .cloned()
    });
    let (username, password, private_key) = if host.auth_type == AuthType::Username {
        (
            cloned_host.username.clone(),
            cloned_host.password.clone(),
            cloned_host
                .private_key
                .and_then(|id| private_keys.iter().find(|private_key| private_key.id == id))
                .map(|p| p.content.clone()),
        )
    } else {
        (
            identity.as_ref().map(|identity| identity.username.clone()),
            identity
                .as_ref()
                .and_then(|identity| identity.password.clone()),
            identity
                .as_ref()
                .and_then(|identity| identity.private_key.clone())
                .and_then(|id| private_keys.iter().find(|private_key| private_key.id == id))
                .map(|p| p.content.clone()),
        )
    };

    let username = username.ok_or(ApiError::NotFound {
        item: "username".to_string(),
    })?;

    Ok((host, username, password, private_key))
}
