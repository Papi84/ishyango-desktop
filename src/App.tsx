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
  const [loadingAI, setLoadingAI] = useState<boolean>(false)
  const [aiError, setAiError] = useState<string>('')
  const [commits, setCommits] = useState<Commit[]>([])

  const handleTextSelect = async (text: string, context: { page?: number }) => {
    setSelectedText(text)
    setLoadingAI(true)
    setAiError('')
    setAiInsight(null)

    const pageNumber = context.page ?? 1

    try {
      await invoke('save_commit', {
        text,
        page: pageNumber,
        bookTitle: 'Current Book',
        tags: `Page ${pageNumber}`,
        notes: null
      })

      const insight = await invoke<AIInsight>('extract_ai_insights', { text })
      setAiInsight(insight)

      const loadedCommits = await invoke<Commit[]>('get_commits')
      setCommits(loadedCommits)

      console.log('✅ AI Insights:', insight)
    } catch (err) {
      setAiError('AI failed: ' + (err as Error).message)
      console.error('Error:', err)
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

  const debouncedHandleTextSelect = debounce(handleTextSelect, 500)

  return (
    <div className="container">
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
