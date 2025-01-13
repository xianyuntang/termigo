use crate::domain::setting::models::Settings;
use crate::domain::store::r#enum::StoreKey;
use crate::domain::traits::Identifiable;
use crate::infrastructure::error::ApiError;
use serde_json::json;
use std::sync::Arc;
use tauri::Wry;
use tauri_plugin_store::Store;

#[derive(Clone)]
pub struct StoreManager {
    store: Arc<Store<Wry>>,
}

impl StoreManager {
    pub fn new(store: Arc<Store<Wry>>) -> Self {
        if !store.has(StoreKey::Hosts.as_str()) {
            store.set(StoreKey::Hosts.as_str(), json!([]));
        }
        if !store.has(StoreKey::Identities.as_str()) {
            store.set(StoreKey::Identities.as_str(), json!([]));
        }
        if !store.has(StoreKey::PrivateKeys.as_str()) {
            store.set(StoreKey::PrivateKeys.as_str(), json!([]));
        }
        if !store.has(StoreKey::Settings.as_str()) {
            store.set(StoreKey::Settings.as_str(), json!(Settings::default()));
        }
        Self { store }
    }
}

impl StoreManager {
    pub fn get_data<T>(&self, key: StoreKey) -> Result<T, ApiError>
    where
        T: serde::de::DeserializeOwned,
    {
        Ok(serde_json::from_value::<T>(
            self.store.get(key.as_str()).unwrap_or(json!([])),
        )?)
    }

    pub fn get_item<T>(&self, key: StoreKey, id: &str) -> Result<Option<T>, ApiError>
    where
        T: Clone + serde::de::DeserializeOwned + PartialEq + Identifiable,
    {
        let items = self.get_data::<Vec<T>>(key)?;

        let item = items.iter().find(|i| i.id() == id).cloned();

        Ok(item)
    }
}

impl StoreManager {
    pub fn update_data<T>(&self, key: StoreKey, data: T) -> Result<(), ApiError>
    where
        T: serde::ser::Serialize,
    {
        Ok(self.store.set(key.as_str(), json!(data)))
    }

    pub fn clear_data(&self) {
        self.store.reset();
    }
}
