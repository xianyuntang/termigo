use serde::{Deserialize, Serialize};
use tokio_util::bytes::Bytes;

#[derive(Serialize, Deserialize, Debug)]
pub struct StdinEventData {
    pub key: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StdoutEventData {
    pub message: Bytes,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WindowChangeEventData {
    pub cols: u32,
    pub rows: u32,
}
