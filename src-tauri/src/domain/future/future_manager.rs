use nanoid::nanoid;
use std::collections::HashMap;
use tokio_util::sync::CancellationToken;

#[derive(Clone)]
pub struct FutureManager {
    cancel_tokens: HashMap<String, CancellationToken>,
}

impl FutureManager {
    pub fn new() -> Self {
        Self {
            cancel_tokens: HashMap::new(),
        }
    }
}

impl FutureManager {
    pub fn add(&mut self, cancel_token: CancellationToken, id: Option<String>) -> String {
        let id = id.unwrap_or(nanoid!());
        self.cancel_tokens.entry(id.clone()).or_insert(cancel_token);
        id
    }

    pub fn abort(&mut self, id: &str) {
        if let Some(cancel_token) = self.cancel_tokens.remove(id) {
            cancel_token.cancel();
        }
    }

    pub fn exist(&self, id: &str) -> bool {
        self.cancel_tokens.contains_key(id)
    }
}
