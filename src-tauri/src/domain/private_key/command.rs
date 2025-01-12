use crate::domain::private_key::models::PrivateKey;
use crate::domain::store::r#enum::StoreKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use serde_json::json;
use tauri;
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn list_private_keys(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_private_keys called");

    let store_manager = &state.lock().await.store_manager;

    let private_keys = store_manager.get_data::<Vec<PrivateKey>>(StoreKey::PrivateKeys)?;

    Ok(Response::from_data(private_keys))
}

#[tauri::command]
pub async fn add_private_key(
    state: State<'_, Mutex<AppData>>,
    label: String,
    content: String,
) -> Result<Response, ApiError> {
    log::debug!("add_private_key called");

    let store_manager = &state.lock().await.store_manager;

    let mut private_keys = store_manager.get_data::<Vec<PrivateKey>>(StoreKey::PrivateKeys)?;

    let private_key = PrivateKey::new(label, content);

    private_keys.push(private_key.clone());

    store_manager.update_data(StoreKey::PrivateKeys, private_keys)?;

    Ok(Response::from_value(json!(private_key)))
}

#[tauri::command]
pub async fn update_private_key(
    state: State<'_, Mutex<AppData>>,
    id: String,
    label: String,
    content: String,
) -> Result<Response, ApiError> {
    log::debug!("update_private_key called");

    let store_manager = &state.lock().await.store_manager;

    let mut private_keys = store_manager.get_data::<Vec<PrivateKey>>(StoreKey::PrivateKeys)?;

    let private_key = if let Some(private_key) = private_keys
        .iter_mut()
        .find(|private_key| private_key.id == id)
    {
        private_key.label = label;
        private_key.content = content;
        Some(private_key.clone())
    } else {
        None
    };

    store_manager.update_data(StoreKey::PrivateKeys, private_keys)?;
    if let Some(private_key) = private_key {
        Ok(Response::from_value(json!(private_key)))
    } else {
        Err(ApiError::NotFound {
            item: format!("private_key {}", id),
        })
    }
}

#[tauri::command]
pub async fn delete_private_key(
    state: State<'_, Mutex<AppData>>,
    id: String,
) -> Result<Response, ApiError> {
    log::debug!("delete_private_key called");

    let store_manager = &state.lock().await.store_manager;

    let mut private_keys = store_manager.get_data::<Vec<PrivateKey>>(StoreKey::PrivateKeys)?;

    if let Some(position) = private_keys
        .iter()
        .position(|private_key| private_key.id == id)
    {
        private_keys.remove(position)
    } else {
        return Err(ApiError::NotFound {
            item: "private_key".to_string(),
        });
    };

    store_manager.update_data(StoreKey::PrivateKeys, private_keys)?;

    Ok(Response::new_ok_message())
}
