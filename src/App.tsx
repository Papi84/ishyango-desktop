import { invoke } from '@tauri-apps/api/core'
import { debounce } from './lib/utils'
import { useState } from 'react'
import PDFViewer from './components/PDFViewer'
import './App.css'

// Simple type for AI insights
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
  const [commits, setCommits] = useState<any[]>([])

  const handleTextSelect = async (text: string, context: any) => {
    setSelectedText(text)
    setLoadingAI(true)
    setAiError('')

    try {
      // For MVP: Just use the selected text directly
      // OCR is for scanned PDFs where text selection doesn't work
      // We'll add AI insights later (local or API)
      
      // For now, create a simple "insight" from the text
      const insight: AIInsight = {
        summary: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        concepts: ['Text extracted from PDF'],
        tags: ['PDF', 'Learning', 'Page ' + context.page]
      }
      
      setAiInsight(insight)
      console.log('✅ Text extracted:', text)
    } catch (err) {
      setAiError('Extraction failed: ' + (err as Error).message)
      console.error('Error:', err)
    } finally {
      setLoadingAI(false)
    }
  }

  // Create debounced version (500ms delay)
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
            <p>Your learning commits will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
