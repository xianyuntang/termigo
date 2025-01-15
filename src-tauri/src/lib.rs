mod domain;
mod infrastructure;

use crate::domain::future::commands::stop_future;
use crate::domain::future::future_manager::FutureManager;
use crate::domain::gpt::command::get_agent_response;
use crate::domain::host::commands::{
    add_host, delete_host, list_hosts, start_terminal_stream, update_host, update_host_fingerprint,
};
use crate::domain::identity::command::{
    add_identity, delete_identity, list_identities, update_identity,
};
use crate::domain::private_key::command::{
    add_private_key, delete_private_key, list_private_keys, update_private_key,
};
use crate::domain::setting::command::{clear_data, get_settings, update_settings};
use crate::domain::store::store_manager::StoreManager;
use crate::infrastructure::app::AppData;
use domain::host::commands::start_tunnel_stream;
use domain::store::r#enum::default_settings;
use infrastructure::updater::update;
use tauri::Manager;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Warn)
                .level_for("termigo_lib", log::LevelFilter::Trace)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let store = tauri_plugin_store::StoreBuilder::new(app, "store.json")
                .defaults(default_settings())
                .build()?;

            app.manage(Mutex::new(AppData {
                store_manager: StoreManager::new(store),
                future_manager: FutureManager::new(),
            }));

            Ok(())
        })
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                update(handle).await.unwrap();
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Host
            add_host,
            delete_host,
            list_hosts,
            update_host,
            update_host_fingerprint,
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
            clear_data,
            // Future
            stop_future
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
