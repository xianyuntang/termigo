use crate::domain::setting::models::Settings;
use crate::domain::store::r#enum::StoreKey;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use async_openai::types::{
    ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs,
    CreateChatCompletionRequestArgs,
};
use async_openai::{config::OpenAIConfig, Client};
use serde_json::json;
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn get_agent_response(
    state: State<'_, Mutex<AppData>>,
    text: String,
) -> Result<Response, ApiError> {
    log::debug!("get_agent_response called");

    let store_manager = &state.lock().await.store_manager;

    let settings = store_manager.get_data::<Settings>(StoreKey::Settings)?;

    if settings.gpt_api_key.is_empty() {
        return Err(ApiError::ApiKeyIsNotSet);
    }

    let config = OpenAIConfig::new().with_api_key(settings.gpt_api_key);
    let client = Client::with_config(config);

    let request = CreateChatCompletionRequestArgs::default().max_tokens(512u32)
        .model("gpt-4o-mini")
        .messages([
            ChatCompletionRequestSystemMessageArgs::default()
                .content("Generate a single-line shell command that can be directly executed when pasted into a terminal. Do not include explanations, code block formatting (such as triple backticks), or additional line breaks. If the output is not a shell script, just return an empty string.")
                .build()?
                .into(),
            ChatCompletionRequestUserMessageArgs::default()
                .content(text)
                .build()?
                .into(),
        ])
        .build()?;
    let response = client.chat().create(request).await?;

    let text = {
        if let Some(chat_choice) = response.choices.first() {
            if let Some(text) = &chat_choice.message.content {
                text.to_owned()
            } else {
                String::new()
            }
        } else {
            String::new()
        }
    };

    Ok(Response::from_value(json!({"text":text})))
}
