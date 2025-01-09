use crate::domain::store::StoreKey;
use crate::infrastructure::app::{AppData, Settings};
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

    let api_key = {
        let config = serde_json::from_value::<Settings>(
            state
                .lock()
                .await
                .store
                .get(StoreKey::Settings.as_str())
                .unwrap_or(json!(Settings::default())),
        )?;

        config.gpt_api_key.to_string()
    };

    if api_key.is_empty() {
        return Err(ApiError::ApiKeyIsNotSet);
    }

    let config = OpenAIConfig::new().with_api_key(api_key);
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
