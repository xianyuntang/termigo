use std::collections::HashMap;

use serde_json::{json, Value};

use crate::domain::setting::models::Settings;

pub enum StoreKey {
    Hosts,
    Identities,
    PrivateKeys,
    Settings,
}

impl StoreKey {
    pub fn as_str(&self) -> &str {
        match self {
            StoreKey::Hosts => "hosts",
            StoreKey::Identities => "identities",
            StoreKey::PrivateKeys => "private_keys",
            StoreKey::Settings => "settings",
        }
    }
}

pub fn default_settings() -> HashMap<String, Value> {
    let mut defaults = HashMap::<String, Value>::new();

    defaults.insert(StoreKey::Hosts.as_str().to_string(), json!([]));
    defaults.insert(StoreKey::Identities.as_str().to_string(), json!([]));
    defaults.insert(StoreKey::PrivateKeys.as_str().to_string(), json!([]));
    defaults.insert(
        StoreKey::Settings.as_str().to_string(),
        json!(Settings::default()),
    );

    defaults
}
