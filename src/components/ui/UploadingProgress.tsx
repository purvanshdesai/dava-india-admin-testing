'use client'
import React from 'react'
import { Progress } from './progress'
import useFileUpload from '@/store/fileUpload'

const UploadingProgress = () => {
  const isFileUploading = useFileUpload(state => state.isInProgress)
  const uploadingFiles = useFileUpload(state => state.files)
  return (
    <div
      style={{ display: isFileUploading ? 'block' : 'none' }}
      className='fixed right-[5%] top-[5%] w-[500px] rounded-lg border border-gray-400 bg-white p-4'
    >
      <div className='text-sm font-semibold'>Uploading</div>
      <div className='mt-3 flex w-full flex-col gap-5'>
        {uploadingFiles.map((file: any, index: number) => (
          <div key={index} className='w-full space-y-1'>
            <div className='text-sm font-semibold'>{file?.fileName}</div>
            <Progress value={Number(file.percentage)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default UploadingProgress
