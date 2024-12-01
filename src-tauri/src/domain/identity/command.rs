use crate::domain::identity::identity::Identity;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use serde_json::json;
use std::convert::identity;
use tauri;
use tauri::State;
use tokio::sync::Mutex;
use url::quirks::username;

#[tauri::command]
pub async fn list_identities(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_identities called");

    let store = &mut state.lock().await.store;

    let identities = store.get("identities").unwrap_or(json!([]));

    Ok(Response::from_value(identities))
}

#[tauri::command]
pub async fn add_identity(
    state: State<'_, Mutex<AppData>>,
    label: Option<String>,
    username: String,
    password: Option<String>,
    key: Option<String>,
) -> Result<Response, ApiError> {
    log::debug!("add_identity called");

    let store = &mut state.lock().await.store;

    let mut identities =
        serde_json::from_value::<Vec<Identity>>(store.get("identities").unwrap_or(json!([])))?;

    let identity = Identity::new(label, username, password, key);

    identities.push(identity);

    store.set("identities", json!(identities));

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn update_identity(
    state: State<'_, Mutex<AppData>>,
    id: String,
    label: Option<String>,
    username: String,
    password: Option<String>,
    key: Option<String>,
) -> Result<Response, ApiError> {
    log::debug!("add_identity called");

    let store = &mut state.lock().await.store;

    let mut identities =
        serde_json::from_value::<Vec<Identity>>(store.get("identities").unwrap_or(json!([])))?;

    if let Some(identity) = identities.iter_mut().find(|identity| identity.id == id) {
        identity.label = label;
        identity.username = username;
        identity.password = password;
        identity.key = key;
    } else {
        return Err(ApiError::NotFoundError {
            item: "identity".to_string(),
        });
    };

    store.set("identities", json!(identities));

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn delete_identity(
    state: State<'_, Mutex<AppData>>,
    id: String,
) -> Result<Response, ApiError> {
    log::debug!("delete_identity called");

    let store = &mut state.lock().await.store;

    let mut identities =
        serde_json::from_value::<Vec<Identity>>(store.get("identities").unwrap_or(json!([])))?;

    if let Some(position) = identities.iter().position(|identity| identity.id == id) {
        identities.remove(position)
    } else {
        return Err(ApiError::NotFoundError {
            item: "identity".to_string(),
        });
    };

    store.set("identities", json!(identities));

    Ok(Response::new_ok_message())
}
