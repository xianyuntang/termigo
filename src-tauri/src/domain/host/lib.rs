use nanoid::nanoid;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub enum AuthType {
    Username,
    Identity,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Host {
    pub id: String,
    pub label: Option<String>,
    pub address: String,
    pub port: u32,
    pub auth_type: AuthType,
    pub identity: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub public_key: Option<String>,
}

impl Host {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        label: Option<String>,
        address: String,
        port: u32,
        auth_type: AuthType,
        identity: Option<String>,
        username: Option<String>,
        password: Option<String>,
        public_key: Option<String>,
    ) -> Self {
        Self {
            id: nanoid!(),
            label,
            address,
            port,
            auth_type,
            identity,
            username,
            password,
            public_key,
        }
    }
}
