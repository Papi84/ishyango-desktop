import Settings from './components/Settings'
import { invoke } from '@tauri-apps/api/core'
import { useState, useEffect } from 'react'
import PDFViewer from './components/PDFViewer'
import { debounce } from './lib/utils'
import './App.css'

interface Commit {
  id: number
  text: string
  page: number
  book_title: string
  tags: string
  notes: string | null
  created_at: string
}

interface AIInsight {
  summary: string
  concepts: string[]
  tags: string[]
}

function App() {
  const [selectedText, setSelectedText] = useState<string>('')
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [loadingAI, setLoadingAI] = useState<boolean>(false)

  const [aiError, setAiError] = useState<string>('')
  const [commits, setCommits] = useState<Commit[]>([])

  const handleTextSelect = async (text: string, context: any) => {
  setSelectedText(text)
  setLoadingAI(true)
  setAiError('')

   const apiKey = localStorage.getItem('qwen_api_key') || ''

  if (!apiKey) {
    setAiError('Please add your Qwen API key in Settings (️ icon)')
    setLoadingAI(false)
    return
  }

  try {
    const insight = await invoke('extract_ai_insights', { 
      text,
      apiKey  // Pass the user's API key
    })
    setAiInsight(insight)
    console.log('✅ AI Insight:', insight)
  } catch (err) {
    setAiError('AI failed: ' + (err as Error).message)
    console.error('AI Error:', err)
  } finally {
    setLoadingAI(false)
  }
}


  useEffect(() => {
    const loadCommits = async () => {
      try {
        const loadedCommits = await invoke<Commit[]>('get_commits')
        setCommits(loadedCommits)
      } catch (err) {
        console.error('Failed to load commits:', err)
      }
    }

    loadCommits()
  }, [])
  const mapCommitToTopic = async (text: string) => {
  try {
    const topics = await invoke('test_taxonomy', { query: text.substring(0, 50) })
    console.log(' Mapped topics:', topics)
    return topics
  } catch (err) {
    console.error('Failed to map topic:', err)
    return []
  }
}


  const debouncedHandleTextSelect = debounce(handleTextSelect, 500)

  return (
    <div className="container">
      <button
  onClick={() => setShowSettings(true)}
    className="fixed top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
>
  ️ Settings
</button>


      <h1>🧠 Ishyango.AI</h1>
      <p className="subtitle">Git-like Learning Companion for PDFs</p>

      <div className="main-content">
        <div className="pdf-section">
          <h2>📄 PDF Viewer</h2>
          <PDFViewer onTextSelect={debouncedHandleTextSelect} />
        </div>

        <div className="ai-section">
          <h2>🤖 AI Extraction</h2>
          <div className="extraction-box">
            <p className="label">Selected Text:</p>
            <p className="text">{selectedText || 'Select text from PDF...'}</p>

            <p className="label">AI Insights:</p>
            {loadingAI && <p className="text">🔄 Processing...</p>}
            {aiError && <p className="text error">{aiError}</p>}
            {aiInsight && (
              <div className="text">
                <p><strong>Summary:</strong> {aiInsight.summary}</p>
                <p><strong>Concepts:</strong></p>
                <ul>
                  {aiInsight.concepts.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
                <p><strong>Tags:</strong> {aiInsight.tags.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="commits-section">
          <h2>📚 Learning Commits</h2>
          <div className="commits-list">
            {commits.length === 0 ? (
              <p>No commits yet. Select text to create your first commit!</p>
            ) : (
              <ul>
                {commits.map((commit) => (
                  <li key={commit.id} className="commit-item">
                    <div className="commit-header">
                      <span className="commit-page">Page {commit.page}</span>
                      <span className="commit-date">
                        {new Date(commit.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="commit-text">{commit.text}</p>
                    <div className="commit-tags">{commit.tags}</div>
                  </li>
                ))}
              </ul>
            )}
            {showSettings && (
  <Settings onClose={() => setShowSettings(false)} />
)}

          </div>
        </div>
      </div>
    </div>
  )
}

export default App
