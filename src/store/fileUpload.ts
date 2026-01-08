'use client'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type FileUpload = {
  isInProgress: boolean
  files: any[]
  fileUploadProgress: (data: {
    percentage: number
    file: File
    key: string
    isCompleted: boolean
  }) => void
  reset: () => void
}

const useFileUpload = create<FileUpload>()(
  devtools(set => ({
    isInProgress: false,
    files: [],
    fileUploadProgress(data) {
      set(state => {
        const { percentage, key, isCompleted, file } = data
        let files = [...state.files]
        const isFileUploading = files.find(file => file.key == key)
        if (isFileUploading) {
          files = files.map(file =>
            file.key == key ? { ...file, percentage, isCompleted } : { ...file }
          )
        } else {
          files.push({ percentage, key, isCompleted, fileName: file.name })
        }
        if (!files.filter(file => !file.isCompleted).length) {
          setTimeout(() => state.reset(), 2000)
        }
        return {
          files: files.sort((a, b) => a.percentage - b.percentage),
          isInProgress: true
        }
      })
    },
    reset() {
      set(() => ({
        files: [],
        isInProgress: false
      }))
    }
  }))
)

export default useFileUpload
