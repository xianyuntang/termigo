use crate::domain::future::future_manager::FutureManager;
use crate::domain::store::store_manager::StoreManager;

#[derive(Clone)]
pub struct AppData {
    pub store_manager: StoreManager,
    pub future_manager: FutureManager,
}
