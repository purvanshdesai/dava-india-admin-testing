'use client'
import React from 'react'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import { printPlugin, RenderPrintProps } from '@react-pdf-viewer/print'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/print/lib/styles/index.css'
import { Button } from '../ui/button'
import { DownloadIcon, PrinterIcon } from 'lucide-react'

const PdfViewerComponent = ({
  pdfUrl,
  fileName = 'Davaindia_Document'
}: {
  pdfUrl: string
  fileName?: string
}) => {
  const printPluginInstance = printPlugin()
  const { Print } = printPluginInstance

  const downloadPDF = (url: string) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.blob()
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${fileName}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(error => {
        console.error('There was an error downloading the PDF:', error)
      })
  }

  return (
    <div className='h-full'>
      {/* Render PDF */}
      <div className=''>
        <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
          <Viewer fileUrl={pdfUrl} plugins={[printPluginInstance]} />
        </Worker>
      </div>

      {/* Print Button */}
      <div className='mt-3 flex items-center justify-center gap-3'>
        <Print>
          {(props: RenderPrintProps) => (
            <Button variant={'outline'} onClick={props.onClick}>
              <PrinterIcon size={20} className='text-label' />
              &nbsp; Print Document
            </Button>
          )}
        </Print>

        <Button variant={'outline'} onClick={() => downloadPDF(pdfUrl)}>
          <DownloadIcon size={20} className='text-label' />
          &nbsp; Download Document
        </Button>
      </div>
    </div>
  )
}

export default PdfViewerComponent
