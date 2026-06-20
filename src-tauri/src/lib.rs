use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIInsight {
    pub summary: String,
    pub concepts: Vec<String>,
    pub tags: Vec<String>,
}

#[tauri::command]
async fn extract_with_qwen(text: String) -> Result<AIInsight, String> {
    let api_key = "sk-594ff735da874f52a55a6ec4937f7793";
    
    let prompt = format!(r#"Analyze this text and extract:
1. A brief summary (2-3 sentences)
2. Key concepts (3-5 bullet points)
3. Relevant tags (5-10 keywords)

Text: "{}"

Respond in JSON format:
{{
  "summary": "...",
  "concepts": ["...", "..."],
  "tags": ["...", "..."]
}}"#, text);
    
   let client = reqwest::Client::new();

let response = client
    .post("https://api.qwen.ai/v1/chat/completions")
    .header("Content-Type", "application/json")
    .header("Authorization", &format!("Bearer {}", api_key))
    .json(&serde_json::json!({
        "model": "qwen-turbo",
        "messages": [
            {
                "role": "system",
                "content": "You are an educational AI assistant. Respond ONLY with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3,
        "max_tokens": 500
    }))
    .send()
    .await
    .map_err(|e| format!("Request failed: {}", e))?;

    
    if !response.status().is_success() {
        return Err(format!("API error: {}", response.status()));
    }
    
    let data = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Parse error: {}", e))?;
    
    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("{}");
    
    let insight: AIInsight = serde_json::from_str(content)
        .map_err(|e| format!("JSON parse error: {}", e))?;
    
    Ok(insight)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![greet, extract_with_qwen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
