use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIInsight {
    pub summary: String,
    pub concepts: Vec<String>,
    pub tags: Vec<String>,
}

#[tauri::command]
async fn extract_with_datalab(text: String) -> Result<AIInsight, String> {
    let api_key = "tE5Gj3rr_MtVdWwSWtcHwNut6JX7MxP96uV4D3yP7RY";
    
    let client = reqwest::Client::new();
    
    let response = client
        .post("https://www.datalab.to/api/v1/extract")
        .header("Content-Type", "application/json")
        .header("X-Api-Key", api_key)
        .json(&serde_json::json!({
            "text": text,
            "extraction_mode": "fast"
        }))
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("API error: {}", response.status()));
    }
    
    let result = response
        .json::<AIInsight>()
        .await
        .map_err(|e| format!("Parse error: {}", e))?;
    
    Ok(result)
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
        .invoke_handler(tauri::generate_handler![greet, extract_with_datalab])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
