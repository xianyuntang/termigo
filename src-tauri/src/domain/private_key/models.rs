use nanoid::nanoid;
use serde::{Deserialize, Serialize};

use crate::domain::traits::Identifiable;

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PrivateKey {
    pub id: String,
    pub label: String,
    pub content: String,
}

impl PrivateKey {
    pub fn new(label: String, content: String) -> Self {
        Self {
            id: nanoid!(),
            label,
            content,
        }
    }
}

impl Identifiable for PrivateKey {
    fn id(&self) -> &str {
        &self.id
    }
}
