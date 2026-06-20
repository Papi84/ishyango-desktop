import { invoke } from '@tauri-apps/api/core'
import { useState } from 'react'
import { extractWithDatalab, type DatalabResult } from './lib/datalab'
import PDFViewer from './components/PDFViewer'
import './App.css'

function App() {
  const [selectedText, setSelectedText] = useState<string>('')
  const [aiInsight, setAiInsight] = useState<DatalabResult | null>(null)
  const [loadingAI, setLoadingAI] = useState<boolean>(false)
  const [aiError, setAiError] = useState<string>('')
  const [commits, setCommits] = useState<any[]>([])

  const handleTextSelect = async (text: string, context: any) => {
  setSelectedText(text)
  setLoadingAI(true)
  setAiError('')
    
    try {
    // Call the Rust command
    const result = await invoke('extract_with_datalab', { text })
     setAiInsight(result)
    console.log('✅ AI Insight:', result)
  } catch (err) {
    setAiError('AI extraction failed: ' + (err as Error).message)
    console.error('AI Error:', err)
  } finally {
    setLoadingAI(false)
  }
}
    return (
    <div className="container">
      <h1>🧠 Ishyango.AI</h1>
      <p className="subtitle">Git-like Learning Companion for PDFs</p>

      <div className="main-content">
        <div className="pdf-section">
          <h2>📄 PDF Viewer</h2>
          <PDFViewer onTextSelect={handleTextSelect} />
        </div>

        <div className="ai-section">
          <h2>🤖 AI Extraction</h2>
          <div className="extraction-box">
            <p className="label">Selected Text:</p>
            <p className="text">{selectedText || 'Select text from PDF...'}</p>

            <p className="label">AI Insights:</p>
            {loadingAI && <p className="text">🔄 AI is thinking...</p>}
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
