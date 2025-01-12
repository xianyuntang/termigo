use crate::domain::identity::models::Identity;
use crate::domain::store::r#enum::StoreKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use tauri;
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn list_identities(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_identities called");

    let store_manager = &state.lock().await.store_manager;

    let identities = store_manager.get_data::<Vec<Identity>>(StoreKey::Identities)?;

    Ok(Response::from_data(identities))
}

#[tauri::command]
pub async fn add_identity(
    state: State<'_, Mutex<AppData>>,
    label: String,
    username: String,
    password: String,
    private_key_ref: String,
) -> Result<Response, ApiError> {
    log::debug!("add_identity called");

    let store_manager = &state.lock().await.store_manager;

    let mut identities = store_manager.get_data::<Vec<Identity>>(StoreKey::Identities)?;

    let identity = Identity::new(Some(label), username, Some(password), Some(private_key_ref));

    identities.push(identity);

    store_manager.update_data(StoreKey::Identities, identities)?;

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn update_identity(
    state: State<'_, Mutex<AppData>>,
    id: String,
    label: String,
    username: String,
    password: String,
    private_key_ref: String,
) -> Result<Response, ApiError> {
    log::debug!("add_identity called");

    let store_manager = &state.lock().await.store_manager;

    let mut identities = store_manager.get_data::<Vec<Identity>>(StoreKey::Identities)?;

    if let Some(identity) = identities.iter_mut().find(|identity| identity.id == id) {
        identity.label = Some(label);
        identity.username = username;
        identity.password = Some(password);
        identity.private_key_ref = Some(private_key_ref);
    } else {
        return Err(ApiError::NotFound {
            item: "identity".to_string(),
        });
    };

    store_manager.update_data(StoreKey::Identities, identities)?;

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn delete_identity(
    state: State<'_, Mutex<AppData>>,
    id: String,
) -> Result<Response, ApiError> {
    log::debug!("delete_identity called");

    let store_manager = &state.lock().await.store_manager;

    let mut identities = store_manager.get_data::<Vec<Identity>>(StoreKey::Identities)?;

    if let Some(position) = identities.iter().position(|identity| identity.id == id) {
        identities.remove(position)
    } else {
        return Err(ApiError::NotFound {
            item: "identity".to_string(),
        });
    };

    store_manager.update_data(StoreKey::Identities, identities)?;

    Ok(Response::new_ok_message())
}
