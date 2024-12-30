use crate::domain::public_keys::lib::PublicKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use serde_json::json;
use tauri;
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn list_public_keys(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_public_keys called");

    let store = &mut state.lock().await.store;

    let public_keys = store.get("public_keys").unwrap_or(json!([]));

    Ok(Response::from_value(public_keys))
}

#[tauri::command]
pub async fn add_public_key(
    state: State<'_, Mutex<AppData>>,
    label: String,
    content: String,
) -> Result<Response, ApiError> {
    log::debug!("add_public_key called");

    let store = &mut state.lock().await.store;

    let mut public_keys =
        serde_json::from_value::<Vec<PublicKey>>(store.get("public_keys").unwrap_or(json!([])))?;

    let public_key = PublicKey::new(label, content);

    public_keys.push(public_key.clone());

    store.set("public_keys", json!(public_keys));

    Ok(Response::from_value(json!(public_key)))
}

#[tauri::command]
pub async fn update_public_key(
    state: State<'_, Mutex<AppData>>,
    id: String,
    label: String,
    content: String,
) -> Result<Response, ApiError> {
    log::debug!("update_public_key called");

    let store = &mut state.lock().await.store;

    let mut public_keys =
        serde_json::from_value::<Vec<PublicKey>>(store.get("public_keys").unwrap_or(json!([])))?;

    let public_key = if let Some(public_key) = public_keys
        .iter_mut()
        .find(|public_key| public_key.id == id)
    {
        public_key.label = label;
        public_key.content = content;
        Some(public_key.clone())
    } else {
        None
    };

    store.set("public_keys", json!(public_keys));
    if let Some(public_key) = public_key {
        Ok(Response::from_value(json!(public_key)))
    } else {
        Err(ApiError::NotFound {
            item: format!("public_key {}", id),
        })
    }
}

#[tauri::command]
pub async fn delete_public_key(
    state: State<'_, Mutex<AppData>>,
    id: String,
) -> Result<Response, ApiError> {
    log::debug!("delete_public_key called");

    let store = &mut state.lock().await.store;

    let mut public_keys =
        serde_json::from_value::<Vec<PublicKey>>(store.get("public_keys").unwrap_or(json!([])))?;

    if let Some(position) = public_keys
        .iter()
        .position(|public_key| public_key.id == id)
    {
        public_keys.remove(position)
    } else {
        return Err(ApiError::NotFound {
            item: "public_key".to_string(),
        });
    };

    store.set("public_keys", json!(public_keys));

    Ok(Response::new_ok_message())
}
