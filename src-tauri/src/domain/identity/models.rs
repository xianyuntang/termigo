use nanoid::nanoid;
use serde::{Deserialize, Serialize};

use crate::domain::traits::Identifiable;
use crate::infrastructure::transform::empty_to_null;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Identity {
    pub id: String,
    #[serde(serialize_with = "empty_to_null")]
    pub label: Option<String>,
    pub username: String,
    #[serde(serialize_with = "empty_to_null")]
    pub password: Option<String>,
    #[serde(serialize_with = "empty_to_null")]
    pub private_key_ref: Option<String>,
}

impl Identity {
    pub fn new(
        label: Option<String>,
        username: String,
        password: Option<String>,
        private_key_ref: Option<String>,
    ) -> Self {
        Self {
            id: nanoid!(),
            label,
            username,
            password,
            private_key_ref,
        }
    }
}

impl Identifiable for Identity {
    fn id(&self) -> &str {
        &self.id
    }
}
