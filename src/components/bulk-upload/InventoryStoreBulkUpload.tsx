import React, { useRef, useState } from 'react'
import DnDFileUpload from '@/components/bulk-upload/DnDFileUpload'
import { uploadFiles } from '@/utils/utils/fileUpload'
import { inventoryBulkUpload } from '@/utils/actions/bulkUpload'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Input } from '../ui/input'
import { useToast } from '@/hooks/use-toast'
import { Button } from '../ui/button'

const InventoryStoreBulkUpload = () => {
  const router: any = useRouter()
  const { toast } = useToast()
  const { data: sessionData } = useSession()
  const templateDownloaderRef = useRef<any>(null)

  const [processName, setProcessName] = useState('')
  const [pickedFile, setPickedFiles] = useState<File | any>()
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false)
  const [uploadedFileDetails, setUploadedFileDetails] = useState<{
    _id: string
    fileName: string
    objectUrl: string
  } | null>()
  const [isValidExcelFile, setIsValidExcelFile] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleDownload = () => {
    if (templateDownloaderRef.current) {
      templateDownloaderRef.current.click()
    }
  }

  const handleInputChange = (event: any) => {
    setProcessName(event.target.value)
  }

  const onPickedFile = (files: Array<File>) => {
    if (!files?.length) return
    const file = files[0]

    setPickedFiles(file)
  }

  const uploadFile = async () => {
    const file = pickedFile
    if (!processName) {
      toast({
        title: 'Process name required!',
        description: `Please enter your process name!`
      })
      return
    }

    setUploadedFileDetails(null)

    setIsFileUploading(true)
    try {
      const resp = await uploadFiles(new Array(file), 's3')

      if (resp?.length) {
        const attachment = resp[0]
        const fileDetails = {
          _id: attachment._id,
          fileName: attachment.objectDetails.fileName,
          objectUrl: attachment.objectUrl,
          processName
        }
        setUploadedFileDetails(fileDetails)
        await inventoryBulkUpload(fileDetails, true, sessionData?.user?.role)
        setIsValidExcelFile(true)
        router.back()
      }
    } catch (err: any) {
      console.log('error while uploading file', err)
      const errorCode = err?.response?.data.message
      setIsValidExcelFile(false)
      if (errorCode === 'NO_DATA')
        setErrorMessage('Excel file does not contain any data')
      else if (errorCode === 'INVALID_TEMPLATE')
        setErrorMessage('Invalid template file')
      else setErrorMessage('Something went wrong on server')
    }
    setIsFileUploading(false)
  }

  if (isFileUploading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    )

  return (
    <div>
      <span className='flex cursor-pointer items-center gap-2'>
        <ArrowLeftIcon size={18} onClick={() => router.back()} /> Back
      </span>

      <div className='mt-5 w-full rounded-lg bg-white p-5 dark:bg-transparent'>
        <div>
          <label htmlFor='processName' className='pb-1 text-sm text-label'>
            Process Name
          </label>
          <Input
            id='processName'
            placeholder='Name your process'
            onInput={handleInputChange}
          />
        </div>

        {pickedFile ? (
          <div className='flex flex-col gap-4 pt-6'>
            <p>
              <strong>File Name:</strong>&nbsp;
              {pickedFile.name}
            </p>

            <div>
              <Button onClick={() => uploadFile()} disabled={isFileUploading}>
                Upload File
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <DnDFileUpload onChange={onPickedFile} />
            <div className='mt-4'>
              <a
                href={'/excel/store-inventory.xlsx'}
                download
                style={{ display: 'none' }}
                ref={templateDownloaderRef}
              ></a>
              <span
                className='cursor-pointer text-[#1890ff] underline'
                onClick={handleDownload}
              >
                Download Template
              </span>
            </div>

            <div className='py-3 text-xs text-label'>
              Note: The Uploaded data will be updated within 1 to 5 minutes.
            </div>
            {uploadedFileDetails && !isValidExcelFile && (
              <div className={'text-red-500'}>{errorMessage}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryStoreBulkUpload
