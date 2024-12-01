use crate::domain::future::future_manager::FutureManager;
use std::sync::Arc;
use tauri::Wry;
use tauri_plugin_store::Store;

pub struct AppData {
    pub store: Arc<Store<Wry>>,
    pub future_manager: FutureManager,
}
