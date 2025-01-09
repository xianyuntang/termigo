pub enum StoreKey {
    Hosts,
    Identities,
    PrivateKeys,
    Settings,
}

impl StoreKey {
    pub fn as_str(&self) -> &str {
        match self {
            StoreKey::Hosts => "hosts",
            StoreKey::Identities => "identities",
            StoreKey::PrivateKeys => "private_keys",
            StoreKey::Settings => "settings",
        }
    }
}
