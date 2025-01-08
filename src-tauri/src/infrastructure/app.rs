use crate::domain::future::future_manager::FutureManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::Wry;
use tauri_plugin_store::Store;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub gpt_api_key: String,
}

impl Settings {
    pub fn default() -> Self {
        Self {
            gpt_api_key: String::new(),
        }
    }
}

pub struct AppData {
    pub store: Arc<Store<Wry>>,
    pub future_manager: FutureManager,
}
