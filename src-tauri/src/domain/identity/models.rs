use nanoid::nanoid;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Identity {
    pub id: String,
    pub label: Option<String>,
    pub username: String,
    pub password: Option<String>,
    pub private_key: Option<String>,
}

impl Identity {
    pub fn new(
        label: Option<String>,
        username: String,
        password: Option<String>,
        private_key: Option<String>,
    ) -> Self {
        Self {
            id: nanoid!(),
            label,
            username,
            password,
            private_key,
        }
    }
}
