use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Commit {
    pub id: Option<i64>,
    pub text: String,
    pub page: i32,
    pub book_title: String,
    pub tags: String,
    pub notes: Option<String>,
    pub created_at: String,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        // Get app data directory
        let app_data = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("ishyango-ai");
        
        // Create directory if it doesn't exist
        fs::create_dir_all(&app_data).unwrap();
        
        // Database path
        let db_path = app_data.join("commits.db");
        
        // Open connection
        let conn = Connection::open(db_path)?;
        
        // Create table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS commits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                page INTEGER NOT NULL,
                book_title TEXT NOT NULL,
                tags TEXT NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL
            )",
            [],
        )?;
        
        Ok(Database { conn })
    }
    
    pub fn save_commit(&self, commit: &Commit) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO commits (text, page, book_title, tags, notes, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                &commit.text,
                &commit.page.to_string(),
                &commit.book_title,
                &commit.tags,
                &commit.notes.clone().unwrap_or_default(),
                &commit.created_at,
            ],
        )?;
        
        Ok(self.conn.last_insert_rowid())
    }
    
    pub fn get_commits(&self) -> Result<Vec<Commit>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, text, page, book_title, tags, notes, created_at 
             FROM commits 
             ORDER BY created_at DESC"
        )?;
                let commits = stmt.query_map([], |row| {
            Ok(Commit {
                id: row.get(0)?,
                text: row.get(1)?,
                page: row.get(2)?,
                book_title: row.get(3)?,
                tags: row.get(4)?,
                notes: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;
        
        commits.collect()
    }
    
    pub fn delete_commit(&self, id: i64) -> Result<usize> {
        self.conn.execute("DELETE FROM commits WHERE id = ?", [id])
    }
}
