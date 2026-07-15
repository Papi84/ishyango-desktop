use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Topic {
    pub id: String,
    #[serde(rename = "type")]
    pub topic_type: String,
    pub subject: String,
    pub domain: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "ageRangeStart")]
    pub age_start: i32,
    #[serde(rename = "ageRangeEnd")]
    pub age_end: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
    #[serde(rename = "topicId")]
    pub topic_id: String,
    #[serde(rename = "prerequisiteId")]
    pub prerequisite_id: String,
    pub strength: String,
    pub reason: String,
}

#[derive(Debug, Clone)]
pub struct Taxonomy {
    pub topics: Vec<Topic>,
    pub dependencies: Vec<Dependency>,
}

impl Taxonomy {
    pub fn load(base_path: &str) -> Result<Self, String> {
        let topics_path = Path::new(base_path).join("topics.json");
        let deps_path = Path::new(base_path).join("dependencies.json");

        // Load topics
        let topics_content = fs::read_to_string(&topics_path)
            .map_err(|e| format!("Failed to read topics.json: {}", e))?;
        
        let topics_wrapper: serde_json::Value = serde_json::from_str(&topics_content)
            .map_err(|e| format!("Failed to parse topics.json: {}", e))?;
        
        let topics_array = topics_wrapper["topics"]
            .as_array()
            .ok_or("topics.json missing 'topics' array")?;
        
        let topics: Vec<Topic> = topics_array
            .iter()
            .filter_map(|v| serde_json::from_value(v.clone()).ok())
            .collect();

        // Load dependencies
        let deps_content = fs::read_to_string(&deps_path)
            .map_err(|e| format!("Failed to read dependencies.json: {}", e))?;
        
        let deps_wrapper: serde_json::Value = serde_json::from_str(&deps_content)
            .map_err(|e| format!("Failed to parse dependencies.json: {}", e))?;
        
        let deps_array = deps_wrapper["dependencies"]
            .as_array()
            .ok_or("dependencies.json missing 'dependencies' array")?;
        
        let dependencies: Vec<Dependency> = deps_array
            .iter()
            .filter_map(|v| serde_json::from_value(v.clone()).ok())
            .collect();

        Ok(Taxonomy { topics, dependencies })
    }

    pub fn find_topics_by_name(&self, query: &str) -> Vec<&Topic> {
        let query_lower = query.to_lowercase();
        self.topics
            .iter()
            .filter(|t| {
                t.name.to_lowercase().contains(&query_lower) ||
                t.description.to_lowercase().contains(&query_lower)
            })
            .collect()
    }

    pub fn get_prerequisites(&self, topic_id: &str) -> Vec<&Dependency> {
        self.dependencies
            .iter()
            .filter(|d| d.topic_id == topic_id)
            .collect()
    }
}
