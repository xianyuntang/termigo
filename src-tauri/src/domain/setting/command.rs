use crate::domain::setting::models::Settings;
use crate::domain::store::r#enum::StoreKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use tauri;
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn get_settings(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("get_settings called");
    let store_manager = &state.lock().await.store_manager;

    let settings = store_manager.get_data::<Settings>(StoreKey::Settings)?;

    Ok(Response::from_data(settings))
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, Mutex<AppData>>,
    gpt_api_key: String,
) -> Result<Response, ApiError> {
    log::debug!("update_settings called");
    let store_manager = &state.lock().await.store_manager;

    let mut settings = store_manager.get_data::<Settings>(StoreKey::Settings)?;

    settings.gpt_api_key = gpt_api_key;

    store_manager.update_data(StoreKey::Settings, settings)?;

    Ok(Response::new_ok_message())
}
