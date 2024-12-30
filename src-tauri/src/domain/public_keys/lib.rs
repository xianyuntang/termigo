use nanoid::nanoid;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PublicKey {
    pub id: String,
    pub label: String,
    pub content: String,
}

impl PublicKey {
    pub fn new(label: String, content: String) -> Self {
        Self {
            id: nanoid!(),
            label,
            content,
        }
    }
}
