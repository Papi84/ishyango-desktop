import { useState, useEffect } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

interface PDFViewerProps {
  onTextSelect: (text: string, context: any) => void
}

export default function PDFViewer({ onTextSelect }: PDFViewerProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageNum, setPageNum] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [scale, setScale] = useState<number>(1.5)
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      loadPDF(file)
    }
  }

  const loadPDF = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result as ArrayBuffer)
      const pdf = await getDocument({ data: typedarray }).promise
      setPdfDoc(pdf)
      setTotalPages(pdf.numPages)
      setPageNum(1)
      renderPage(pdf, 1)
    }
    reader.readAsArrayBuffer(file)
  }

  const renderPage = async (pdf: any, page: number) => {
    if (!canvasRef) return
    const pdfPage = await pdf.getPage(page)
    const viewport = pdfPage.getViewport({ scale })
    const canvas = canvasRef
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.height = viewport.height
    canvas.width = viewport.width
    await pdfPage.render({ canvasContext: context, viewport }).promise
  }

  const goToPage = (newPage: number) => {
    if (pdfDoc && newPage >= 1 && newPage <= totalPages) {
      setPageNum(newPage)
      renderPage(pdfDoc, newPage)
    }
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))

  useEffect(() => {
    if (pdfDoc && pageNum) renderPage(pdfDoc, pageNum)
  }, [pageNum, scale, canvasRef, pdfDoc])

  return (
    <div className="pdf-viewer">
      {!pdfDoc && (
        // FIX 1: Removed data-tauri-drag-region (conflicts with drop)
        // FIX 2: Corrected JSX braces – no stray }} or extra >
        <div
          className={`file-upload ${isDragging ? 'dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.effectAllowed = 'copy'  // improves drop feedback
            setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (file && file.type === 'application/pdf') {
              setPdfFile(file)
              loadPDF(file)
            }
          }}
          style={{
            width: '100%',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default'
          }}
        >
          <label className="upload-btn">
            📁 Upload PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          <p>or drag and drop PDF here</p>
          {isDragging && <p className="drag-hint">📄 Drop the PDF here!</p>}
        </div>
      )}

      {pdfDoc && (
        <div className="pdf-controls">
          <div className="navigation">
            <button onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1}>⬅️ Prev</button>
            <span>Page {pageNum} of {totalPages}</span>
            <button onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= totalPages}>Next ➡️</button>
          </div>
          <div className="zoom-controls">
            <button onClick={zoomOut}>🔍-</button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn}>🔍+</button>
          </div>
          <canvas ref={(el) => setCanvasRef(el)} />
        </div>
      )}
    </div>
  )
}