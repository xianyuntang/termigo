use crate::infrastructure::app::{AppData, Settings};
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use serde_json::json;
use tauri;
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn get_settings(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("get_settings called");
    let store = &state.lock().await.store;

    let settings = store.get("settings").unwrap_or(json!(Settings::default()));

    Ok(Response::from_value(settings))
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, Mutex<AppData>>,
    gpt_api_key: String,
) -> Result<Response, ApiError> {
    log::debug!("update_settings called");
    let store = &state.lock().await.store;

    let mut settings = serde_json::from_value::<Settings>(store.get("settings").unwrap())?;

    settings.gpt_api_key = gpt_api_key;

    store.set("settings", json!(settings));

    Ok(Response::new_ok_message())
}
