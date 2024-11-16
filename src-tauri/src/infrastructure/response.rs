use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
pub(crate) struct Response {
    pub(crate) data: Value,
}
