import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadFileFromURL(url: string, fileName: string): void {
  try {
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
        a.download = fileName ?? ''
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(error => {
        console.error('There was an error downloading the file:', error)
      })
  } catch (e) {
    throw e
  }
}
