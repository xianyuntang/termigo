use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum DownloadEvent {
    #[serde(rename_all = "camelCase")]
    Progress {
        downloaded_length: usize,
        content_length: Option<u64>,
    },
    #[serde(rename_all = "camelCase")]
    Finished,
}
