use crate::domain::setting::event::DownloadEvent;
use crate::domain::setting::models::{Settings, UpdateInformation};
use crate::domain::store::r#enum::StoreKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use tauri;
use tauri::ipc::Channel;
use tauri::State;
use tauri_plugin_updater::UpdaterExt;
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

#[tauri::command]
pub async fn clear_data(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("clear_data called");
    let store_manager = &state.lock().await.store_manager;

    store_manager.clear_data();

    Ok(Response::new_ok_message())
}

#[tauri::command]
pub async fn check_update(app: tauri::AppHandle) -> Result<Response, ApiError> {
    log::debug!("check_update called");
    if let Some(update) = app.updater()?.check().await? {
        Ok(Response::from_data(UpdateInformation {
            can_update: true,
            current_version: app.package_info().version.to_string(),
            latest_version: update.version,
        }))
    } else {
        Ok(Response::from_data(UpdateInformation {
            can_update: false,
            current_version: app.package_info().version.to_string(),
            latest_version: app.package_info().version.to_string(),
        }))
    }
}

#[tauri::command]
pub async fn apply_update(
    app: tauri::AppHandle,
    on_event: Channel<DownloadEvent>,
) -> Result<(), ApiError> {
    log::debug!("apply_update called");
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded_length = 0;
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded_length += chunk_length;
                    on_event
                        .send(DownloadEvent::Progress {
                            downloaded_length,
                            content_length,
                        })
                        .unwrap();
                },
                || {
                    on_event.send(DownloadEvent::Finished).unwrap();
                },
            )
            .await?;

        app.restart();
    }
    Ok(())
}
