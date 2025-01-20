use serde::{Deserialize, Serialize};

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

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInformation {
    pub can_update: bool,
    pub current_version: String,
    pub latest_version: String,
}
