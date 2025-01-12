use crate::{
    domain::{
        host::models::Host,
        store::{r#enum::StoreKey, store_manager::StoreManager},
    },
    infrastructure::error::ApiError,
};

impl StoreManager {
    pub fn get_identity(&self, identity: String) -> Result<Option<Identity>, ApiError> {
        let identities = self.get_data::<Vec<Identity>>(StoreKey::Identities)?;

        let host = hosts.iter().find(|h| h.id == host).cloned();

        Ok(host)
    }
}

impl StoreManager {
    pub fn get_host(&self, host: String) -> Result<Option<Host>, ApiError> {
        let hosts = self.get_data::<Vec<Host>>(StoreKey::Hosts)?;

        let host = hosts.iter().find(|h| h.id == host).cloned();

        Ok(host)
    }
}
