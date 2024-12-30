mod domain;
mod infrastructure;

use crate::domain::future::commands::stop_future;
use crate::domain::future::future_manager::FutureManager;
use crate::domain::host::commands::{
    add_host, delete_host, list_hosts, start_terminal_stream, update_host,
};
use crate::domain::identity::command::{
    add_identity, delete_identity, list_identities, update_identity,
};
use crate::domain::public_keys::command::{
    add_public_key, delete_public_key, list_public_keys, update_public_key,
};
use crate::infrastructure::app::AppData;

use domain::host::commands::start_tunnel_stream;
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            // Public Keys
            add_public_key,
            delete_public_key,
            list_public_keys,
            update_public_key,
            // Future
            stop_future
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
