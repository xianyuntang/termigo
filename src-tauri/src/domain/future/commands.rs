use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use log;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;

#[tauri::command]
pub async fn stop_future(state: State<'_, Mutex<AppData>>, id: &str) -> Result<Response, ApiError> {
    log::debug!("stop_future called");

    let mut app_data = state.lock().await;

    app_data.future_manager.abort(id);

    Ok(Response {
        data: json!({"message":"ok"}),
    })
}
