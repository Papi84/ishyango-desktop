import { useState } from 'react'
import PDFViewer from './components/PDFViewer.tsx'
import './App.css'

function App() {
  const [selectedText, setSelectedText] = useState<string>('')
  const [aiExtraction, setAiExtraction] = useState<string>('')
  const [commits, setCommits] = useState<any[]>([])

  const handleTextSelect = (text: string, context: any) => {
    setSelectedText(text)
    setAiExtraction('AI extraction coming next...')
  }

  return (
    <div className="container">
      <h1>🦴 Ishyango.AI</h1>
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
            <p className="text">{aiExtraction || 'AI will extract concepts here...'}</p>
          </div>
        </div>
      </div>

      <div className="commits-section">
        <h2>📜 Learning Commits</h2>
        <div className="commits-list">
          <p>Your learning commits will appear here...</p>
        </div>
      </div>
    </div>
  )
}

export default App
