mod domain;
mod infrastructure;

use crate::domain::future::commands::stop_future;
use crate::domain::future::future_manager::FutureManager;
use crate::domain::gpt::command::get_agent_response;
use crate::domain::host::commands::{
    add_host, delete_host, list_hosts, start_terminal_stream, update_host,
};
use crate::domain::identity::command::{
    add_identity, delete_identity, list_identities, update_identity,
};
use crate::domain::private_key::command::{
    add_private_key, delete_private_key, list_private_keys, update_private_key,
};
use crate::domain::setting::command::{get_settings, update_settings};
use crate::infrastructure::app::{AppData, Settings};
use serde_json::json;

use domain::host::commands::start_tunnel_stream;
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Warn)
                .level_for("termigo_lib", log::LevelFilter::Trace)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let store = app.store("store.json")?;
            if store.get("settings").is_none() {
                store.set("settings", json!(Settings::default()))
            }
            app.manage(Mutex::new(AppData {
                store,
                future_manager: FutureManager::new(),
            }));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Host
            add_host,
            delete_host,
            list_hosts,
            update_host,
            start_terminal_stream,
            start_tunnel_stream,
            // Identity
            add_identity,
            delete_identity,
            list_identities,
            update_identity,
            // Private Key
            add_private_key,
            delete_private_key,
            list_private_keys,
            update_private_key,
            // GPT
            get_agent_response,
            // Setting
            update_settings,
            get_settings,
            // Future
            stop_future
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
