use serde::Serialize;
use serde_json::{json, Value};

#[derive(Serialize)]
pub struct Response {
    data: Value,
}

impl Response {
    pub fn new_ok_message() -> Self {
        Self {
            data: json!({"message":"ok"}),
        }
    }
    pub fn from_value(data: Value) -> Self {
        Self { data }
    }

    pub fn from_data<T>(data: T) -> Self
    where
        T: serde::ser::Serialize,
    {
        Self { data: json!(data) }
    }
}
