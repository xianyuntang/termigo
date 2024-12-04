use serde::{Deserialize, Serialize};
use tokio_util::bytes::Bytes;

#[derive(Serialize, Deserialize, Debug)]
pub enum StatusType {
    Open,
    Close,
    Pending,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum EvenType {
    In,
    Out,
    WindowChange,
    Status,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Data {
    In(String),
    Out(Bytes),
    Size((u32, u32)),
    Status(StatusType),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EventData {
    pub data: Data,
}
