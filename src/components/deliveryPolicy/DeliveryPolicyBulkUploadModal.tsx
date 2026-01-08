'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Upload,
  X
} from 'lucide-react'

import SocketNotificationListener from '@/utils/SocketNotificationListener'
import { useToast } from '@/hooks/use-toast'

type ZoneUploadPreview = {
  zoneName: string
  postalCodes: string[]
  storeCodes: string[]
  rows: number[]
}

type SkippedPincode = {
  pincode: string | number
  reason: string
  rowRef?: string
  zoneName?: string
}

type UploadProgress = {
  total: number
  processed: number
  successful: number
  created: number
  updated: number
  skipped: number
  conflicts: number
  failed: number
  errors: string[]
  skippedPincodes?: SkippedPincode[]
  isCompleted: boolean
}

interface DeliveryPolicyBulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const normalizeCell = (value: unknown): string => {
  if (typeof value === 'number') return value.toString().trim()
  if (typeof value === 'string') return value.trim()
  return ''
}

const PINCODE_REGEX = /^\d{6}$/
const STORE_CODE_REGEX = /^[A-Za-z0-9-]+$/

export default function DeliveryPolicyBulkUploadModal({
  isOpen,
  onClose,
  onSuccess
}: DeliveryPolicyBulkUploadModalProps) {
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [zonesData, setZonesData] = useState<ZoneUploadPreview[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    conflicts: 0,
    failed: 0,
    errors: [],
    skippedPincodes: [],
    isCompleted: false
  })

  const resetState = useCallback(() => {
    setFile(null)
    setZonesData([])
    setValidationErrors([])
    setIsProcessing(false)
    setUploadProgress({
      total: 0,
      processed: 0,
      successful: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      conflicts: 0,
      failed: 0,
      errors: [],
      skippedPincodes: [],
      isCompleted: false
    })
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose, resetState])

  useEffect(() => {
    if (!isProcessing) return

    const handleProgressUpdate = (payload: any) => {
      if (payload?.type === 'delivery_policy_bulk_upload_progress') {
        const data = payload?.data || {}
        setUploadProgress(prev => ({
          ...prev,
          total: data.total ?? prev.total,
          processed: data.processed ?? prev.processed,
          successful: data.successful ?? prev.successful,
          created: data.created ?? prev.created,
          updated: data.updated ?? prev.updated,
          skipped: data.skipped ?? prev.skipped,
          conflicts: data.conflicts ?? prev.conflicts,
          failed: data.failed ?? prev.failed,
          errors: Array.isArray(data.errors) ? data.errors : prev.errors,
          skippedPincodes: Array.isArray(data.skippedPincodes)
            ? data.skippedPincodes
            : prev.skippedPincodes,
          isCompleted: false
        }))
      } else if (payload?.type === 'delivery_policy_bulk_upload_complete') {
        const data = payload?.data || {}
        setUploadProgress(prev => ({
          ...prev,
          total: data.total ?? prev.total,
          processed: data.processed ?? data.total ?? prev.total,
          successful: data.successful ?? prev.successful,
          created: data.created ?? prev.created,
          updated: data.updated ?? prev.updated,
          skipped: data.skipped ?? prev.skipped,
          conflicts: data.conflicts ?? prev.conflicts,
          failed: data.failed ?? prev.failed,
          errors: Array.isArray(data.errors) ? data.errors : prev.errors,
          skippedPincodes: Array.isArray(data.skippedPincodes)
            ? data.skippedPincodes
            : prev.skippedPincodes,
          isCompleted: true
        }))
        setIsProcessing(false)
      }
    }

    const handleError = (payload: any) => {
      const message = payload?.error || 'Bulk upload failed'
      toast({
        title: 'Error',
        description: message
      })
      setIsProcessing(false)
    }

    const setupSocketListeners = async () => {
      if (!SocketNotificationListener.isInitialized) {
        await SocketNotificationListener.initialize()
      }

      const socket = SocketNotificationListener.socket

      if (socket && socket.connected) {
        socket.on('delivery_policy_bulk_upload_progress', handleProgressUpdate)
        socket.on('delivery_policy_bulk_upload_complete', handleProgressUpdate)
        socket.on('delivery_policy_bulk_upload_error', handleError)
      }
    }

    setupSocketListeners()

    return () => {
      const socket = SocketNotificationListener.socket
      if (socket) {
        socket.off('delivery_policy_bulk_upload_progress', handleProgressUpdate)
        socket.off('delivery_policy_bulk_upload_complete', handleProgressUpdate)
        socket.off('delivery_policy_bulk_upload_error', handleError)
      }
    }
  }, [isProcessing, toast])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      setValidationErrors([])
      setZonesData([])
      processExcelFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx'
      ],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const processExcelFile = async (excelFile: File) => {
    try {
      const data = await excelFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1
      }) as unknown[][]

      if (jsonData.length < 2) {
        setValidationErrors([
          'Excel file must contain at least a header row and one data row'
        ])
        return
      }

      const headers = (jsonData[0] || []).map(header =>
        normalizeCell(header).toLowerCase()
      )
      const zoneIndex = headers.findIndex(header => header === 'zone name')
      const pincodeIndex = headers.findIndex(header => header === 'pincode')
      const storeCodeIndex = headers.findIndex(
        header => header === 'store code'
      )

      const missing: string[] = []
      if (zoneIndex === -1) missing.push('zone name')
      if (pincodeIndex === -1) missing.push('pincode')

      if (missing.length) {
        setValidationErrors([
          `Missing required columns: ${missing.join(', ')}`,
          'Required columns: zone name, pincode'
        ])
        return
      }

      const zoneMap = new Map<
        string,
        {
          zoneName: string
          postalCodes: Set<string>
          storeCodes: Set<string>
          rows: number[]
        }
      >()
      const errors: string[] = []

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        const rowNumber = i + 1
        const zoneName = normalizeCell(row?.[zoneIndex])
        const pincodeValue = normalizeCell(row?.[pincodeIndex])
        const storeCodeValue =
          storeCodeIndex !== -1 ? normalizeCell(row?.[storeCodeIndex]) : ''

        if (!zoneName) {
          errors.push(`Row ${rowNumber}: Zone name is required`)
          continue
        }

        if (!pincodeValue) {
          errors.push(`Row ${rowNumber} (${zoneName}): Pincode is required`)
          continue
        }

        const digits = pincodeValue.replace(/[^0-9]/g, '')
        if (!PINCODE_REGEX.test(digits)) {
          errors.push(
            `Row ${rowNumber} (${zoneName}): Invalid pincode ${pincodeValue}`
          )
          continue
        }

        const key = zoneName.toLowerCase()
        if (!zoneMap.has(key)) {
          zoneMap.set(key, {
            zoneName,
            postalCodes: new Set<string>(),
            storeCodes: new Set<string>(),
            rows: [rowNumber]
          })
        } else {
          zoneMap.get(key)?.rows.push(rowNumber)
        }

        zoneMap.get(key)?.postalCodes.add(digits)

        if (storeCodeValue) {
          const parsedCodes = storeCodeValue
            .split(/[,\n]/)
            .map(code => code.trim())
            .filter(code => code.length > 0)

          for (const code of parsedCodes) {
            if (!STORE_CODE_REGEX.test(code)) {
              errors.push(
                `Row ${rowNumber} (${zoneName}): Invalid store code ${code}`
              )
              continue
            }

            zoneMap.get(key)?.storeCodes.add(code.toUpperCase())
          }
        }
      }

      const aggregated = Array.from(zoneMap.values()).map(item => ({
        zoneName: item.zoneName,
        postalCodes: Array.from(item.postalCodes).sort(),
        storeCodes: Array.from(item.storeCodes).sort(),
        rows: item.rows
      }))

      if (!aggregated.length) {
        errors.push('No valid delivery policy rows found in the file')
      }

      setZonesData(aggregated)
      setValidationErrors(errors)
    } catch (error) {
      console.error('Failed to process delivery policy bulk upload file', error)
      setValidationErrors([
        'Failed to process Excel file. Please ensure it follows the template format.'
      ])
    }
  }

  const handleUpload = async () => {
    if (!zonesData.length) {
      toast({
        title: 'Error',
        description: 'No valid delivery policy data to upload'
      })
      return
    }

    setIsProcessing(true)
    setUploadProgress({
      total: zonesData.length,
      processed: 0,
      successful: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      conflicts: 0,
      failed: 0,
      errors: [],
      skippedPincodes: [],
      isCompleted: false
    })

    try {
      if (!SocketNotificationListener.isInitialized) {
        await SocketNotificationListener.initialize()
      }

      if (!SocketNotificationListener.isSocketReady()) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Socket connection timeout'))
          }, 5000)

          SocketNotificationListener.socket?.once('connect', () => {
            clearTimeout(timeout)
            resolve(true)
          })

          SocketNotificationListener.socket?.once(
            'connect_error',
            (error: any) => {
              clearTimeout(timeout)
              reject(error)
            }
          )
        })
      }

      if (!SocketNotificationListener.isSocketReady()) {
        throw new Error(
          'Socket connection not available. Please refresh and try again.'
        )
      }

      SocketNotificationListener.socket.emit(
        'start_delivery_policy_bulk_upload',
        {
          policies: zonesData.map(zone => ({
            zoneName: zone.zoneName,
            postalCodes: zone.postalCodes,
            storeCodes: zone.storeCodes,
            rows: zone.rows
          }))
        }
      )
    } catch (error: any) {
      console.error('Error starting delivery policy bulk upload:', error)
      toast({
        title: 'Error',
        description:
          error?.message || 'Failed to start delivery policy bulk upload'
      })
      setIsProcessing(false)
    }
  }

  const handleUploadComplete = () => {
    if (uploadProgress.successful > 0) {
      toast({
        title: 'Success',
        description: `Bulk upload completed. ${uploadProgress.created} created, ${uploadProgress.updated} updated, ${uploadProgress.conflicts} conflicts.`
      })
      onSuccess?.()
    } else {
      toast({
        title: 'Error',
        description: 'Bulk upload completed without any successful updates'
      })
    }
    handleClose()
  }

  const downloadTemplate = () => {
    window.open('/excel/delivery-policy-bulk-upload-template.xlsx', '_blank')
  }

  const progressPercentage = useMemo(() => {
    if (!uploadProgress.total) return 0
    return (uploadProgress.processed / uploadProgress.total) * 100
  }, [uploadProgress.processed, uploadProgress.total])

  const hasBlockingErrors = validationErrors.some(error =>
    error.toLowerCase().includes('no valid')
  )

  const hasStoreCodes = useMemo(
    () => zonesData.some(zone => zone.storeCodes.length > 0),
    [zonesData]
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Bulk Upload Delivery Policies
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='flex items-center justify-between rounded-lg bg-blue-50 p-4'>
            <div>
              <h4 className='font-medium text-blue-900'>Download Template</h4>
              <p className='text-sm text-blue-700'>
                Use the template to map zone names to pincodes and (optionally)
                store codes
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={downloadTemplate}>
              <Download className='mr-2 h-4 w-4' />
              Download Template
            </Button>
          </div>

          {!file && (
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className='mx-auto mb-4 h-12 w-12 text-gray-400' />
              <p className='mb-2 text-lg font-medium text-gray-700'>
                {isDragActive
                  ? 'Drop the Excel file here'
                  : 'Drag & drop Excel file here'}
              </p>
              <p className='mb-4 text-sm text-gray-500'>or click to browse</p>
              <p className='text-xs text-gray-400'>
                Supported formats: .xlsx, .xls
              </p>
            </div>
          )}

          {file && (
            <div className='flex items-center justify-between rounded-lg bg-green-50 p-4'>
              <div className='flex items-center gap-3'>
                <FileSpreadsheet className='h-8 w-8 text-green-600' />
                <div>
                  <p className='font-medium text-green-900'>{file.name}</p>
                  <p className='text-sm text-green-700'>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setFile(null)
                  setZonesData([])
                  setValidationErrors([])
                }}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='mt-0.5 h-5 w-5 text-red-600' />
                <div className='space-y-1'>
                  <p className='font-medium text-red-900'>Validation Notices</p>
                  <ScrollArea className='max-h-40 pr-2'>
                    <ul className='space-y-1 text-sm text-red-800'>
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}

          {zonesData.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Zones ready for upload</h4>
                <Badge variant='secondary'>{zonesData.length} zones</Badge>
              </div>
              <ScrollArea className='max-h-64 overflow-scroll rounded-lg border'>
                <table className='w-full overflow-auto text-sm'>
                  <thead className='sticky top-0 bg-gray-50'>
                    <tr>
                      <th className='px-3 py-2 text-left'>Zone Name</th>
                      <th className='px-3 py-2 text-left'>Pincodes</th>
                      {hasStoreCodes ? (
                        <th className='px-3 py-2 text-left'>Store Codes</th>
                      ) : null}
                      <th className='px-3 py-2 text-left'>Row Numbers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zonesData.map((zone, index) => (
                      <tr
                        key={zone.zoneName + index}
                        className='border-t hover:bg-gray-50'
                      >
                        <td className='px-3 py-2 font-medium text-gray-700'>
                          {zone.zoneName}
                        </td>
                        <td className='px-3 py-2 text-sm text-gray-600'>
                          {zone.postalCodes.slice(0, 5).join(', ')}
                          {zone.postalCodes.length > 5 && (
                            <span className='text-gray-400'>
                              {' '}
                              +{zone.postalCodes.length - 5} more
                            </span>
                          )}
                        </td>
                        {hasStoreCodes ? (
                          <td className='px-3 py-2 text-sm text-gray-600'>
                            {zone.storeCodes.length
                              ? zone.storeCodes.slice(0, 5).join(', ') +
                                (zone.storeCodes.length > 5
                                  ? ` (+${zone.storeCodes.length - 5} more)`
                                  : '')
                              : '-'}
                          </td>
                        ) : null}
                        <td className='px-3 py-2 text-xs text-gray-500'>
                          {zone.rows.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          )}

          {isProcessing && !uploadProgress.isCompleted && (
            <div className='max-w-2xl space-y-3 rounded-lg border border-gray-200 p-4'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Upload Progress</h4>
                <span className='text-sm text-gray-600'>
                  {uploadProgress.processed} / {uploadProgress.total}
                </span>
              </div>
              <Progress value={progressPercentage} className='h-2' />
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div className='flex items-center gap-2 text-green-700'>
                  <CheckCircle className='h-4 w-4' />
                  <span>Successful: {uploadProgress.successful}</span>
                </div>
                <div className='flex items-center gap-2 text-yellow-700'>
                  <AlertCircle className='h-4 w-4' />
                  <span>Conflicts: {uploadProgress.conflicts}</span>
                </div>
                <div className='flex items-center gap-2 text-red-700'>
                  <X className='h-4 w-4' />
                  <span>Failed: {uploadProgress.failed}</span>
                </div>
                {uploadProgress.skipped > 0 && (
                  <div className='flex items-center gap-2 text-orange-700'>
                    <AlertCircle className='h-4 w-4' />
                    <span>Skipped: {uploadProgress.skipped}</span>
                  </div>
                )}
              </div>
              {uploadProgress.errors.length > 0 && (
                <div className='mt-3 max-h-40 w-full overflow-y-auto rounded border bg-red-50 p-3'>
                  <p className='mb-2 text-sm font-medium text-red-900'>
                    Errors:
                  </p>
                  <ul className='space-y-1 text-xs text-red-800'>
                    {uploadProgress.errors.slice(0, 20).map((error, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-red-500'>•</span>
                        <span className='flex-1 truncate text-wrap'>
                          {error}
                        </span>
                      </li>
                    ))}
                    {uploadProgress.errors.length > 20 && (
                      <li className='font-medium text-red-600'>
                        ... and {uploadProgress.errors.length - 20} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {uploadProgress.skippedPincodes &&
                uploadProgress.skippedPincodes.length > 0 && (
                  <div className='mt-3 max-h-40 w-full overflow-y-auto rounded border bg-orange-50 p-3'>
                    <p className='mb-2 text-sm font-medium text-orange-900'>
                      Skipped Pincodes ({uploadProgress.skippedPincodes.length}
                      ):
                    </p>
                    <ScrollArea className='max-h-32'>
                      <table className='w-full text-xs'>
                        <thead>
                          <tr className='border-b border-orange-200'>
                            <th className='px-2 py-1 text-left text-orange-800'>
                              Pincode
                            </th>
                            <th className='px-2 py-1 text-left text-orange-800'>
                              Zone
                            </th>
                            {/* <th className='px-2 py-1 text-left text-orange-800'>
                              Row
                            </th> */}
                            <th className='px-2 py-1 text-left text-orange-800'>
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadProgress.skippedPincodes
                            .slice(0, 50)
                            .map((skipped, index) => (
                              <tr
                                key={index}
                                className='border-b border-orange-100'
                              >
                                <td className='px-2 py-1 font-medium text-orange-800'>
                                  {String(skipped.pincode)}
                                </td>
                                <td className='px-2 py-1 text-orange-700'>
                                  {skipped.zoneName || '-'}
                                </td>
                                {/* <td className='px-2 py-1 text-orange-700'>
                                  {skipped.rowRef || '-'}
                                </td> */}
                                <td className='px-2 py-1 text-orange-700'>
                                  {skipped.reason}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {uploadProgress.skippedPincodes.length > 50 && (
                        <p className='mt-2 text-xs font-medium text-orange-600'>
                          ... and {uploadProgress.skippedPincodes.length - 50}{' '}
                          more skipped pincodes
                        </p>
                      )}
                    </ScrollArea>
                  </div>
                )}
            </div>
          )}

          {uploadProgress.isCompleted && (
            <div className='max-w-2xl space-y-4 rounded-lg border border-green-200 bg-green-50 p-6'>
              <div className='flex items-center gap-3'>
                <CheckCircle className='h-8 w-8 text-green-600' />
                <div>
                  <h4 className='text-lg font-semibold text-green-900'>
                    Upload Completed
                  </h4>
                  <p className='text-sm text-green-700'>
                    Delivery policy bulk upload has finished
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div className='flex items-center gap-2 text-green-800'>
                  <CheckCircle className='h-4 w-4' />
                  <span>Created: {uploadProgress.created}</span>
                </div>
                <div className='flex items-center gap-2 text-green-800'>
                  <CheckCircle className='h-4 w-4' />
                  <span>Updated: {uploadProgress.updated}</span>
                </div>
                <div className='flex items-center gap-2 text-yellow-700'>
                  <AlertCircle className='h-4 w-4' />
                  <span>Conflicts: {uploadProgress.conflicts}</span>
                </div>
                <div className='flex items-center gap-2 text-red-700'>
                  <X className='h-4 w-4' />
                  <span>Failed: {uploadProgress.failed}</span>
                </div>
                {uploadProgress.skipped > 0 && (
                  <div className='flex items-center gap-2 text-orange-700'>
                    <AlertCircle className='h-4 w-4' />
                    <span>Skipped: {uploadProgress.skipped}</span>
                  </div>
                )}
              </div>

              {uploadProgress.errors.length > 0 && (
                <div className='w-full rounded border border-red-200 bg-red-50 p-3'>
                  <p className='mb-2 text-sm font-medium text-red-900'>
                    Errors:
                  </p>
                  <ScrollArea className='max-h-40 overflow-auto pr-6'>
                    <ul className='space-y-1 text-xs text-red-800'>
                      {uploadProgress.errors.map((error, index) => (
                        // ensure the LI can shrink inside flex layouts
                        <li
                          key={index}
                          className='flex min-w-0 items-start gap-2'
                        >
                          <span className='text-red-500'>•</span>

                          {/* important: flex-1 + min-w-0 + w-0 lets this shrink; allow wrapping */}
                          <span className='w-0 min-w-0 flex-1 whitespace-normal break-words pr-1'>
                            {error}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              {uploadProgress.skippedPincodes &&
                uploadProgress.skippedPincodes.length > 0 && (
                  <div className='w-full rounded border border-orange-200 bg-orange-50 p-3'>
                    <p className='mb-2 text-sm font-medium text-orange-900'>
                      Skipped Pincodes ({uploadProgress.skippedPincodes.length}
                      ):
                    </p>
                    <ScrollArea className='max-h-40 overflow-auto pr-6'>
                      <table className='w-full text-xs'>
                        <thead>
                          <tr className='border-b border-orange-200'>
                            <th className='px-2 py-1 text-left text-orange-800'>
                              Pincode
                            </th>
                            <th className='px-2 py-1 text-left text-orange-800'>
                              Zone
                            </th>
                            {/* <th className='px-2 py-1 text-left text-orange-800'>
                              Row
                            </th> */}
                            <th className='px-2 py-1 text-left text-orange-800'>
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadProgress.skippedPincodes.map(
                            (skipped, index) => (
                              <tr
                                key={index}
                                className='border-b border-orange-100'
                              >
                                <td className='px-2 py-1 font-medium text-orange-800'>
                                  {String(skipped.pincode)}
                                </td>
                                <td className='px-2 py-1 text-orange-700'>
                                  {skipped.zoneName || '-'}
                                </td>
                                {/* <td className='px-2 py-1 text-orange-700'>
                                  {skipped.rowRef || '-'}
                                </td> */}
                                <td className='px-2 py-1 text-orange-700'>
                                  {skipped.reason}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>
                )}

              <div className='flex justify-end'>
                <Button
                  onClick={handleUploadComplete}
                  className='bg-green-600 hover:bg-green-700'
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        {!uploadProgress.isCompleted && (
          <DialogFooter>
            <Button
              variant='outline'
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                !zonesData.length ||
                isProcessing ||
                (validationErrors.length > 0 && hasBlockingErrors)
              }
            >
              {isProcessing ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
