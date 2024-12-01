use nanoid::nanoid;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Host {
    pub id: String,
    pub label: Option<String>,
    pub address: String,
    pub port: u32,
    pub identity_id: String,
}

impl Host {
    pub fn new(label: Option<String>, address: String, port: u32, identity_id: String) -> Self {
        Self {
            id: nanoid!(),
            label,
            address,
            port,
            identity_id,
        }
    }
}
