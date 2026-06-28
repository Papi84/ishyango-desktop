# 🧠 Ishyango.AI

**Git-like Learning Companion for PDFs**

[![Hackathon](https://img.shields.io/badge/QwenCloud-Hackathon%202026-blue)](https://qwencloud-hackathon.devpost.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/Status-MVP%20Ready-brightgreen)]()

> Track your learning, one commit at a time.

---

## 📖 Overview

Ishyango.AI is a revolutionary PDF learning tool that treats knowledge acquisition like version control. Just as developers track code changes with Git commits, learners can now track their learning journey with **Git-like knowledge commits**.

Each text selection from a PDF is saved as a "commit" with:
- Full text excerpt
- Page number and source
- Timestamp
- Tags and notes
- Persistent local storage

---

## ✨ Features

### ✅ Shipped (v1.0)

- **📄 PDF Viewer** - Full-featured PDF rendering with smooth navigation
- **✏️ Text Selection** - Highlight and capture text from any PDF
- **📚 Learning Commits** - Save selections as timestamped commits (SQLite)
- **🔍 Commit History** - View and search your learning over time
- **💾 Local Storage** - 100% privacy-first, no cloud dependencies
- **🦎 EasyOCR** - Local OCR for scanned PDFs (offline capable)

### 🚧 Coming Soon (v2.0)

- **🤖 AI Insights** - Qwen API integration for automated summaries
- **📤 Export** - Export commits to Markdown, Notion, Obsidian
- **🔁 Spaced Repetition** - Review commits at optimal intervals
- **🔎 Full-Text Search** - Search across all your commits

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React + TypeScript |
| **Desktop Shell** | Tauri v2 |
| **Backend** | Rust |
| **Database** | SQLite (rusqlite) |
| **PDF Rendering** | PDF.js |
| **OCR** | EasyOCR (local) |
| **AI** | Qwen API (v2.0) |

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Git

### Clone the Repository

```bash
git clone https://github.com/Papi84/ishyango-desktop.git
cd ishyango-desktop
