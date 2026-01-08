import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import React from 'react'
import { FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onChange: any
}

export default function DnDFileUpload(props: FileUploadProps) {
  const { onChange } = props
  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    onChange(acceptedFiles)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1, // Allow only one file
    multiple: false,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx'
      ]
    }
  })

  return (
    <div
      {...getRootProps()}
      className='mt-10 flex h-[30vh] w-full flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#6B7280]'
    >
      <div>
        <FileUp />
      </div>
      {isDragActive ? (
        <p>Drop the files here ... </p>
      ) : (
        <p className='flex flex-row items-center gap-2 text-lg font-semibold text-black'>
          Drag & drop files or click to browse
          <Button className='border font-semibold'>Browse</Button>
        </p>
      )}
      <p>Supported formats: Excel sheets</p>
      <input {...getInputProps()} />
    </div>
  )
}
