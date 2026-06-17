import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Use stable worker version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

interface PDFViewerProps {
  onTextSelect: (text: string, context: any) => void
}

export default function PDFViewer({ onTextSelect }: PDFViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageNum, setPageNum] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [scale, setScale] = useState<number>(1.5)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const renderTaskRef = useRef<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      loadPDF(file)
    }
  }

  const loadPDF = async (file: File) => {
    setLoading(true)
    setError('')
    
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer)
        const pdf = await pdfjsLib.getDocument({data: typedarray}).promise
        
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        setPageNum(1)
        setLoading(false)
      }
      reader.readAsArrayBuffer(file)
    } catch (err) {
      setError('Failed to load PDF: ' + (err as Error).message)
      setLoading(false)
    }
  }

  const renderPage = async (pdf: any, page: number) => {
    if (!canvasRef.current) {
      console.error('Canvas not found!')
      return
    }

    // Cancel any ongoing render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    try {
      const pdfPage = await pdf.getPage(page)
      const viewport = pdfPage.getViewport({ scale })

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) {
        console.error('Canvas context is null!')
        return
      }

      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      renderTaskRef.current = pdfPage.render(renderContext)
      await renderTaskRef.current.promise

      console.log('✅ Page', page, 'rendered successfully!')
    } catch (err: any) {
      if (err.name === 'RenderingCancelled') {
        return // Expected, don't show error
      }
            console.error('Render error:', err)
      setError('Failed to render page ' + page + ': ' + err.message)
    }
  }

  const goToPage = (newPage: number) => {if (pdfDoc && newPage >= 1 && newPage <= totalPages) {
      setPageNum(newPage)
    }
  }

  const zoomIn = () => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.25, 3)
      setTimeout(() => {
        if (pdfDoc && pageNum) {
          renderPage(pdfDoc, pageNum)
        }
      }, 100)
      return newScale
    })
  }

  const zoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.25, 0.5)
      setTimeout(() => {
        if (pdfDoc && pageNum) {
          renderPage(pdfDoc, pageNum)
        }
      }, 100)
      return newScale
    })
  }

  useEffect(() => {
    if (pdfDoc && pageNum) {
      const timeoutId = setTimeout(() => {
        renderPage(pdfDoc, pageNum)
      }, 50)
      
      return () => clearTimeout(timeoutId)
    }
  }, [pageNum])

  return (
    <div style={{ padding: '1rem', height: '100%' }}>
      <h2 style={{ marginBottom: '1rem', color: '#226f60' }}>📄 PDF Viewer</h2>
      
      {!pdfDoc ? (
        <div style={{
          border: '2px dashed #ccc',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#226f60',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          >
            📁 Upload PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <p style={{ color: '#666' }}>or drag and drop PDF here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading && <p>Loading PDF...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1}>⬅️ Prev</button>
            <span>Page {pageNum} of {totalPages}</span>
            <button onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= totalPages}>Next ➡️</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <button onClick={zoomOut}>🔍-</button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn}>🔍+</button>
          </div>

          <div style={{ overflow: 'auto', border: '1px solid #ccc', borderRadius: '8px', maxHeight: '600px' }}>
            <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />
          </div>
        </div>
      )}
    </div>
  )
}
