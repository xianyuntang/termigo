use crate::domain::identity::models::Identity;
use crate::domain::store::StoreKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use crate::infrastructure::transform::convert_empty_to_option;
use serde_json::json;
use tauri;
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn list_identities(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_identities called");

    let store = &mut state.lock().await.store;

    let identities = store
        .get(StoreKey::Identities.as_str())
        .unwrap_or(json!([]));

    Ok(Response::from_value(identities))
}

#[tauri::command]
pub async fn add_identity(
    state: State<'_, Mutex<AppData>>,
    label: String,
    username: String,
    password: String,
    private_key: String,
) -> Result<Response, ApiError> {
    log::debug!("add_identity called");

    let store = &mut state.lock().await.store;

    let mut identities = serde_json::from_value::<Vec<Identity>>(
        store
            .get(StoreKey::Identities.as_str())
            .unwrap_or(json!([])),
    )?;

    let identity = Identity::new(
        convert_empty_to_option(label),
        username,
        convert_empty_to_option(password),
        convert_empty_to_option(private_key),
    );

    identities.push(identity);

    store.set(StoreKey::Identities.as_str(), json!(identities));

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn update_identity(
    state: State<'_, Mutex<AppData>>,
    id: String,
    label: String,
    username: String,
    password: String,
    private_key: String,
) -> Result<Response, ApiError> {
    log::debug!("add_identity called");

    let store = &mut state.lock().await.store;

    let mut identities = serde_json::from_value::<Vec<Identity>>(
        store
            .get(StoreKey::Identities.as_str())
            .unwrap_or(json!([])),
    )?;

    if let Some(identity) = identities.iter_mut().find(|identity| identity.id == id) {
        identity.label = convert_empty_to_option(label);
        identity.username = username;
        identity.password = convert_empty_to_option(password);
        identity.private_key = convert_empty_to_option(private_key);
    } else {
        return Err(ApiError::NotFound {
            item: "identity".to_string(),
        });
    };

    store.set(StoreKey::Identities.as_str(), json!(identities));

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn delete_identity(
    state: State<'_, Mutex<AppData>>,
    id: String,
) -> Result<Response, ApiError> {
    log::debug!("delete_identity called");

    let store = &mut state.lock().await.store;

    let mut identities = serde_json::from_value::<Vec<Identity>>(
        store
            .get(StoreKey::Identities.as_str())
            .unwrap_or(json!([])),
    )?;

    if let Some(position) = identities.iter().position(|identity| identity.id == id) {
        identities.remove(position)
    } else {
        return Err(ApiError::NotFound {
            item: "identity".to_string(),
        });
    };

    store.set(StoreKey::Identities.as_str(), json!(identities));

    Ok(Response::new_ok_message())
}
