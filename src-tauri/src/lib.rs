use serde::{Deserialize, Serialize};
use chrono::Utc;
mod db;
use db::{Database, Commit};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIInsight {
    pub summary: String,
    pub concepts: Vec<String>,
    pub tags: Vec<String>,
}
#[tauri::command]
async fn extract_ai_insights(text: String) -> Result<AIInsight, String> {
    let api_key = "sk-ws-H.RRYERP.tQ1U.MEUCIQDesrbF3YVXVpNLZwlZNya14sM54jYs67ebk_mX7tPn1QIgYcNDkzCAtiw3xPsGxkQ0jjUQUYjJrr-6VkIHqHD_74I";
    
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
        .post("https://ws-1v51cgudquqphqdp.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions")
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
        .invoke_handler(tauri::generate_handler![
            greet,
            save_commit,
            get_commits,
            delete_commit,
            extract_ai_insights
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
#[tauri::command]
fn save_commit(text: String, page: i32, book_title: String, tags: String, notes: Option<String>) -> Result<i64, String> {
    let db = Database::new().map_err(|el| el.to_string())?;
    let commit = Commit {
        id: None,
        text,
        page,
        book_title,
        tags,
        notes,
        created_at: Utc::now().to_rfc3339(),
    };
    
    db.save_commit(&commit).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_commits() -> Result<Vec<Commit>, String> {
    let db = Database::new().map_err(|e| e.to_string())?;
    db.get_commits().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_commit(id: i64) -> Result<(), String> {
    let db = Database::new().map_err(|e| e.to_string())?;
    db.delete_commit(id).map_err(|e| e.to_string())?;
    Ok(())
}
