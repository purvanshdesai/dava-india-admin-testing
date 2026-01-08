'use client'
import api from '@/lib/axios'
import useFileUpload from '@/store/fileUpload'
import axios from 'axios'
import { uid } from 'uid'

const uploadToServer = async (
  attachments: { file: File; key: string }[],
  storageType?: string
) => {
  try {
    const formData = new FormData()
    for (const attachment of attachments) {
      formData.append('attachments', attachment.file)
    }
    const uploadedFiles = await api.post(
      `${process.env.NEXT_PUBLIC_API_URL}/attachments${storageType ? `?storageType=${storageType}` : ''}`,
      formData
    )
    return uploadedFiles.data
  } catch (error) {
    throw error
  }
}

const removeFileFromServer = async (files: Array<string>) => {
  try {
    for (const url of files ?? []) {
      await api.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/attachments/1}?deleteUrl=${url}`
      )
    }

    return {}
  } catch (error) {
    throw error
  }
}

const uploadToS3 = async (attachments: { file: File; key: string }[]) => {
  try {
    const signedUrlReqData = attachments.map(attachment => ({
      fileName: attachment.file.name,
      contentType: attachment.file.type,
      size: attachment.file.size
    }))
    const { data: attachmentData } = await api.post(
      `${process.env.NEXT_PUBLIC_API_URL}/attachments`,
      {
        files: signedUrlReqData
      }
    )
    const preSignedUrls = attachmentData?.map(
      (attachment: any) => attachment.preSignedUrl
    )
    const s3Data = attachments.map((attachment, index: number) => ({
      ...attachment,
      url: preSignedUrls[index]
    }))
    await Promise.all(
      s3Data.map((item: { file: File; key: string; url: string }) => {
        return axios.put(item.url, item.file, {
          headers: {
            'Content-Type': item.file.type
          },
          onUploadProgress(progressEvent) {
            const { progress }: any = progressEvent
            // console.log('progress ', progress)
            const uploadPercentage = Math.floor(progress * 100)

            useFileUpload.getState().fileUploadProgress({
              key: item.key,
              file: item.file,
              percentage: uploadPercentage as number,
              isCompleted: uploadPercentage < 100 ? false : true
            })
          }
        })
      })
    )
    return attachmentData
  } catch (error) {
    console.log('Error from File Upload', error)
    throw error
  }
}

export const uploadFiles = async (
  files: File[],
  storageType?: 'local' | 's3'
) => {
  try {
    const attachments = files.map(file => ({
      file,
      key: uid()
    }))

    const localStorage =
      storageType === 'local' || process.env.NEXT_PUBLIC_ENV == 'local'
    if (localStorage) {
      return await uploadToServer(attachments, storageType)
    } else {
      return await uploadToS3(attachments)
    }
  } catch (error) {
    throw error
  }
}

export const removeFiles = async (
  files: Array<string>,
  storageType?: 'local'
) => {
  try {
    if (storageType === 'local' || process.env.NEXT_PUBLIC_ENV == 'local') {
      return await removeFileFromServer(files)
    } else {
    }
  } catch (error) {
    throw error
  }
}
