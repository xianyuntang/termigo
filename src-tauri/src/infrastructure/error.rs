use std::string::FromUtf8Error;

use log;
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error(transparent)]
    TauriError(#[from] tauri::Error),

    #[error(transparent)]
    BoxedError(#[from] Box<dyn std::error::Error + Send + Sync>),

    #[error(transparent)]
    IoError(#[from] std::io::Error),

    #[error(transparent)]
    AddrParseError(#[from] std::net::AddrParseError),

    #[error(transparent)]
    SerdeJsonError(#[from] serde_json::Error),

    #[error(transparent)]
    FromUtf8Error(#[from] FromUtf8Error),

    #[error(transparent)]
    RusshError(#[from] russh::Error),

    #[error(transparent)]
    RusshKeyError(#[from] russh::keys::Error),

    #[error("The specified {item} was not found.")]
    NotFoundError { item: String },

    #[error("Error: {message}.")]
    CustomError { message: String },
}

impl serde::Serialize for ApiError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let error = serde_json::to_string(&json!({ "error": self.to_string() }))
            .expect("Failed to serialize JSON");

        log::error!("{error}");

        serializer.serialize_str(&error)
    }
}
