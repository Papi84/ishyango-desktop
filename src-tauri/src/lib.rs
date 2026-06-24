use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIInsight {
    pub summary: String,
    pub concepts: Vec<String>,
    pub tags: Vec<String>,
}
#[tauri::command]
async fn extract_with_ocr(image_path: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .post("http://localhost:5000/extract")
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({
            "image_path": image_path
        }))
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("OCR server error: {}", response.status()));
    }
    
    let result = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Parse error: {}", e))?;
    
    if let Some(error) = result.get("error") {
        return Err(error.as_str().unwrap_or("Unknown error").to_string());
    }
    
    let text = result
        .get("text")
        .and_then(|t| t.as_str())
        .unwrap_or("No text extracted");
    
    Ok(text.to_string())
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
        .invoke_handler(tauri::generate_handler![greet, extract_with_ocr])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
