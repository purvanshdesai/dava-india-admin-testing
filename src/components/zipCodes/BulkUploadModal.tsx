'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'

import * as XLSX from 'xlsx'
import SocketNotificationListener from '@/utils/SocketNotificationListener'
import { useToast } from '@/hooks/use-toast'

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ExcelRow {
  zipcode: string
  area: string
  district: string
  state: string
  latitude?: number
  longitude?: number
}

interface UploadProgress {
  total: number
  processed: number
  successful: number
  failed: number
  duplicates: number
  errors: string[]
  isCompleted: boolean
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<ExcelRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    duplicates: 0,
    errors: [],
    isCompleted: false
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Use ref to track if we're in batch processing mode
  const isBatchProcessingRef = useRef(false)

  const { toast } = useToast()

  // Define handleProgressUpdate at component level so it can be accessed by handleUpload
  const handleProgressUpdate = useCallback((data: any) => {
    // Ignore socket events when in batch processing mode
    if (isBatchProcessingRef.current) {
      return
    }

    console.log('Received socket event:', data.type, data.data)
    if (data.type === 'bulk_upload_progress') {
      setUploadProgress({
        total: data.data.total,
        processed: data.data.processed,
        successful: data.data.successful,
        failed: data.data.failed,
        duplicates: data.data.duplicates,
        errors: data.data.errors || [],
        isCompleted: false
      })
    } else if (data.type === 'bulk_upload_complete') {
      setUploadProgress({
        total: data.data.total,
        processed: data.data.total,
        successful: data.data.successful,
        failed: data.data.failed,
        duplicates: data.data.duplicates,
        errors: data.data.errors || [],
        isCompleted: true
      })
      setIsProcessing(false)
    }
  }, [])

  // Listen for socket events for real-time progress updates
  useEffect(() => {
    if (!isProcessing) return

    const setupSocketListeners = async () => {
      // Ensure socket is initialized
      if (!SocketNotificationListener.isInitialized) {
        await SocketNotificationListener.initialize()
      }

      // Listen for socket events
      if (
        SocketNotificationListener.socket &&
        SocketNotificationListener.socket.connected
      ) {
        console.log('Setting up socket listeners for bulk upload')
        SocketNotificationListener.socket.on(
          'bulk_upload_progress',
          handleProgressUpdate
        )
        SocketNotificationListener.socket.on(
          'bulk_upload_complete',
          handleProgressUpdate
        )
        SocketNotificationListener.socket.on(
          'bulk_upload_error',
          (data: any) => {
            toast({
              title: 'Error',
              description: data.error || 'Bulk upload failed'
            })
            setIsProcessing(false)
          }
        )
      } else {
        console.error('Socket not available for setting up listeners')
      }
    }

    setupSocketListeners()

    return () => {
      if (SocketNotificationListener.socket) {
        SocketNotificationListener.socket.off(
          'bulk_upload_progress',
          handleProgressUpdate
        )
        SocketNotificationListener.socket.off(
          'bulk_upload_complete',
          handleProgressUpdate
        )
        SocketNotificationListener.socket.off('bulk_upload_error')
      }
    }
  }, [isProcessing, onSuccess])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      setValidationErrors([])
      setExcelData([])
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

  const processExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length < 2) {
        setValidationErrors([
          'Excel file must contain at least a header row and one data row'
        ])
        return
      }

      const headers = jsonData[0] as string[]
      const requiredHeaders = ['zipcode', 'area', 'district', 'state']

      // Check if all required headers are present
      const missingHeaders = requiredHeaders.filter(
        header =>
          !headers.some(h => h?.toLowerCase().trim() === header.toLowerCase())
      )

      if (missingHeaders.length > 0) {
        setValidationErrors([
          `Missing required columns: ${missingHeaders.join(', ')}`,
          'Required columns: zipcode, area, district, state (latitude and longitude are optional)'
        ])
        return
      }

      // Map headers to indices
      const headerMap = {
        zipcode: headers.findIndex(h => h?.toLowerCase().trim() === 'zipcode'),
        area: headers.findIndex(h => h?.toLowerCase().trim() === 'area'),
        district: headers.findIndex(
          h => h?.toLowerCase().trim() === 'district'
        ),
        state: headers.findIndex(h => h?.toLowerCase().trim() === 'state'),
        latitude: headers.findIndex(
          h => h?.toLowerCase().trim() === 'latitude'
        ),
        longitude: headers.findIndex(
          h => h?.toLowerCase().trim() === 'longitude'
        )
      }

      // Process data rows
      const processedData: ExcelRow[] = []
      const errors: string[] = []

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]
        const rowNumber = i + 1

        try {
          const zipcode = String(row[headerMap.zipcode] || '').trim()
          const area = String(row[headerMap.area] || '').trim()
          const district = String(row[headerMap.district] || '').trim()
          const state = String(row[headerMap.state] || '').trim()

          // Coordinates are optional - check if columns exist and have valid values
          const latitudeValue =
            headerMap.latitude !== -1
              ? String(row[headerMap.latitude] || '').trim()
              : ''
          const longitudeValue =
            headerMap.longitude !== -1
              ? String(row[headerMap.longitude] || '').trim()
              : ''
          const latitude =
            latitudeValue && !isNaN(parseFloat(latitudeValue))
              ? parseFloat(latitudeValue)
              : undefined
          const longitude =
            longitudeValue && !isNaN(parseFloat(longitudeValue))
              ? parseFloat(longitudeValue)
              : undefined

          // Validate required fields
          if (!zipcode) {
            errors.push(`Row ${rowNumber}: Zipcode is required`)
            continue
          }
          if (!area) {
            errors.push(`Row ${rowNumber}: Area is required`)
            continue
          }
          if (!district) {
            errors.push(`Row ${rowNumber}: District is required`)
            continue
          }
          if (!state) {
            errors.push(`Row ${rowNumber}: State is required`)
            continue
          }

          // Validate zipcode format (6 digits for Indian pincodes)
          if (!/^\d{6}$/.test(zipcode)) {
            errors.push(`Row ${rowNumber}: Zipcode must be 6 digits`)
            continue
          }

          // Validate coordinates only if provided
          if (latitude !== undefined && longitude !== undefined) {
            if (isNaN(latitude) || isNaN(longitude)) {
              errors.push(
                `Row ${rowNumber}: Invalid latitude or longitude values`
              )
              continue
            }
            if (latitude < -90 || latitude > 90) {
              errors.push(
                `Row ${rowNumber}: Latitude must be between -90 and 90`
              )
              continue
            }
            if (longitude < -180 || longitude > 180) {
              errors.push(
                `Row ${rowNumber}: Longitude must be between -180 and 180`
              )
              continue
            }
          }

          processedData.push({
            zipcode,
            area,
            district,
            state,
            ...(latitude !== undefined &&
              longitude !== undefined && {
                latitude,
                longitude
              })
          })
        } catch (error) {
          errors.push(`Row ${rowNumber}: Invalid data format`)
        }
      }

      if (errors.length > 0) {
        setValidationErrors(errors)
      } else {
        setValidationErrors([])
      }

      setExcelData(processedData)
    } catch (error) {
      setValidationErrors([
        'Failed to process Excel file. Please check the file format.'
      ])
    }
  }

  const handleUpload = async () => {
    if (excelData.length === 0) {
      toast({
        title: 'Error',
        description: 'No valid data to upload'
      })
      return
    }

    setIsProcessing(true)
    setUploadProgress({
      total: excelData.length,
      processed: 0,
      successful: 0,
      failed: 0,
      duplicates: 0,
      errors: [],
      isCompleted: false
    })

    try {
      // Ensure socket is initialized before using it
      if (!SocketNotificationListener.isInitialized) {
        console.log('Initializing socket connection...')
        await SocketNotificationListener.initialize()
      }

      // Wait for socket connection if not connected
      if (!SocketNotificationListener.isSocketReady()) {
        console.log('Waiting for socket connection...')
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Socket connection timeout'))
          }, 5000) // 5 second timeout

          SocketNotificationListener.socket.once('connect', () => {
            clearTimeout(timeout)
            resolve(true)
          })

          SocketNotificationListener.socket.once(
            'connect_error',
            (error: any) => {
              clearTimeout(timeout)
              reject(error)
            }
          )
        })
      }

      if (!SocketNotificationListener.isSocketReady()) {
        console.error('Socket not available or not connected')
        toast({
          title: 'Error',
          description:
            'Socket connection not available. Please refresh the page.'
        })
        setIsProcessing(false)
        return
      }

      // Set batch processing mode to prevent socket listeners from interfering
      isBatchProcessingRef.current = true

      // Split data into batches to avoid "payload too large" error
      const BATCH_SIZE = 500 // Process 500 records at a time
      const batches = []
      for (let i = 0; i < excelData.length; i += BATCH_SIZE) {
        batches.push(excelData.slice(i, i + BATCH_SIZE))
      }

      console.log(
        `Processing ${excelData.length} records in ${batches.length} batches of ${BATCH_SIZE}`
      )

      // Process batches sequentially
      const allResults = {
        successful: 0,
        failed: 0,
        duplicates: 0,
        errors: [] as string[]
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        const batchNumber = batchIndex + 1

        console.log(
          `Processing batch ${batchNumber}/${batches.length} (${batch.length} records)`
        )

        // Process batch and wait for completion
        const batchResult = await new Promise<any>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Batch ${batchNumber} timeout`))
          }, 300000) // 5 minutes timeout per batch

          // Listen for completion event
          const completeHandler = (data: any) => {
            clearTimeout(timeout)
            resolve(data?.data || data)
          }

          // Listen for error event
          const errorHandler = (error: any) => {
            clearTimeout(timeout)
            reject(error)
          }

          SocketNotificationListener.socket.once(
            'bulk_upload_complete',
            completeHandler
          )
          SocketNotificationListener.socket.once(
            'bulk_upload_error',
            errorHandler
          )

          // Emit batch upload event
          SocketNotificationListener.socket.emit('start_bulk_upload', {
            data: batch
          })
        })

        // Aggregate results
        allResults.successful += batchResult.successful || 0
        allResults.failed += batchResult.failed || 0
        allResults.duplicates += batchResult.duplicates || 0
        if (batchResult.errors && batchResult.errors.length > 0) {
          allResults.errors.push(...batchResult.errors)
        }

        // Update progress
        const processedSoFar = Math.min(
          (batchIndex + 1) * BATCH_SIZE,
          excelData.length
        )
        setUploadProgress({
          total: excelData.length,
          processed: processedSoFar,
          successful: allResults.successful,
          failed: allResults.failed,
          duplicates: allResults.duplicates,
          errors: allResults.errors,
          isCompleted: batchIndex === batches.length - 1
        })
      }

      console.log('All batches processed successfully:', allResults)

      // Set final completion state - don't call onSuccess yet!
      // Let the user review results first, then click "Close" button
      setUploadProgress({
        total: excelData.length,
        processed: excelData.length,
        successful: allResults.successful,
        failed: allResults.failed,
        duplicates: allResults.duplicates,
        errors: allResults.errors,
        isCompleted: true
      })
      setIsProcessing(false)

      // Show final toast
      toast({
        title: 'Upload Complete',
        description: `${allResults.successful} successful, ${allResults.duplicates} duplicates, ${allResults.failed} failed`
      })
    } catch (error: any) {
      console.error('Error during bulk upload:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to complete bulk upload'
      })
      setUploadProgress(prev => ({
        ...prev,
        isCompleted: true
      }))
      setIsProcessing(false)
    } finally {
      // Reset batch processing mode
      isBatchProcessingRef.current = false
    }
  }

  const handleClose = () => {
    setFile(null)
    setExcelData([])
    setValidationErrors([])
    setUploadProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      duplicates: 0,
      errors: [],
      isCompleted: false
    })
    setIsProcessing(false)
    onClose()
  }

  const handleUploadComplete = () => {
    if (uploadProgress.successful > 0) {
      toast({
        title: 'Success',
        description: `Bulk upload completed! ${uploadProgress.successful} successful, ${uploadProgress.duplicates} duplicates skipped`
      })
      onSuccess?.()
    } else {
      toast({
        title: 'Error',
        description: 'Bulk upload failed with no successful records'
      })
    }
    handleClose()
  }

  const downloadTemplate = () => {
    const templateData = [
      ['zipcode', 'area', 'district', 'state', 'latitude', 'longitude'],
      ['110001', 'Connaught Place', 'New Delhi', 'Delhi', '28.6315', '77.2167'],
      ['400001', 'Fort', 'Mumbai', 'Maharashtra', '18.9339', '72.8347'],
      ['560001', 'Bangalore', 'Bangalore', 'Karnataka', '', '']
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'ZipCodes')
    XLSX.writeFile(wb, 'zipcode_bulk_upload_template.xlsx')
  }

  const progressPercentage =
    uploadProgress.total > 0
      ? (uploadProgress.processed / uploadProgress.total) * 100
      : 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Bulk Upload Zip Codes
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Template Download */}
          <div className='flex items-center justify-between rounded-lg bg-blue-50 p-4'>
            <div>
              <h4 className='font-medium text-blue-900'>Download Template</h4>
              <p className='text-sm text-blue-700'>
                Use our template to ensure correct format
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={downloadTemplate}>
              <Download className='mr-2 h-4 w-4' />
              Download Template
            </Button>
          </div>

          {/* File Upload Area */}
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

          {/* File Info */}
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
                  setExcelData([])
                  setValidationErrors([])
                }}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='mt-0.5 h-5 w-5 text-red-600' />
                <div className='space-y-1'>
                  <p className='font-medium text-red-900'>Validation Errors:</p>
                  <ul className='max-h-32 space-y-1 overflow-y-auto text-sm text-red-800'>
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Data Preview */}
          {excelData.length > 0 && validationErrors.length === 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Data Preview</h4>
                <Badge variant='secondary'>
                  {excelData.length} records ready
                </Badge>
              </div>
              <div className='max-h-48 overflow-y-auto rounded-lg border'>
                <table className='w-full text-sm'>
                  <thead className='sticky top-0 bg-gray-50'>
                    <tr>
                      <th className='px-3 py-2 text-left'>Row</th>
                      <th className='px-3 py-2 text-left'>Zipcode</th>
                      <th className='px-3 py-2 text-left'>Area</th>
                      <th className='px-3 py-2 text-left'>District</th>
                      <th className='px-3 py-2 text-left'>State</th>
                      <th className='px-3 py-2 text-left'>Coordinates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.slice(0, 10).map((row, index) => (
                      <tr key={index} className='border-t hover:bg-gray-50'>
                        <td className='px-3 py-2 font-medium text-gray-600'>
                          {index + 1}
                        </td>
                        <td className='px-3 py-2 font-mono text-blue-600'>
                          {row.zipcode}
                        </td>
                        <td className='px-3 py-2'>{row.area}</td>
                        <td className='px-3 py-2'>{row.district}</td>
                        <td className='px-3 py-2'>{row.state}</td>
                        <td className='px-3 py-2 text-xs text-gray-500'>
                          {row.latitude !== undefined &&
                          row.longitude !== undefined
                            ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
                            : 'Will be fetched from Google API'}
                        </td>
                      </tr>
                    ))}
                    {excelData.length > 10 && (
                      <tr>
                        <td
                          colSpan={6}
                          className='bg-gray-50 px-3 py-2 text-center text-gray-500'
                        >
                          ... and {excelData.length - 10} more records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isProcessing && !uploadProgress.isCompleted && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Upload Progress</h4>
                <span className='text-sm text-gray-600'>
                  {uploadProgress.processed} / {uploadProgress.total}
                </span>
              </div>
              <Progress value={progressPercentage} className='h-2' />
              <div className='grid grid-cols-3 gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span>Success: {uploadProgress.successful}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4 text-yellow-600' />
                  <span>Duplicates: {uploadProgress.duplicates}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <X className='h-4 w-4 text-red-600' />
                  <span>Failed: {uploadProgress.failed}</span>
                </div>
              </div>
              {uploadProgress.errors.length > 0 && (
                <div className='mt-3 max-h-40 overflow-y-auto rounded border bg-red-50 p-3'>
                  <p className='mb-2 text-sm font-medium text-red-900'>
                    Errors ({uploadProgress.errors.length}):
                  </p>
                  <ul className='space-y-1 text-xs text-red-800'>
                    {uploadProgress.errors.slice(0, 15).map((error, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-red-500'>•</span>
                        <span className='flex-1'>{error}</span>
                      </li>
                    ))}
                    {uploadProgress.errors.length > 15 && (
                      <li className='font-medium text-red-600'>
                        ... and {uploadProgress.errors.length - 15} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Upload Completed */}
          {uploadProgress.isCompleted && (
            <div className='space-y-4 rounded-lg border border-green-200 bg-green-50 p-6'>
              <div className='flex items-center gap-3'>
                <CheckCircle className='h-8 w-8 text-green-600' />
                <div>
                  <h4 className='text-lg font-semibold text-green-900'>
                    Upload Completed!
                  </h4>
                  <p className='text-sm text-green-700'>
                    Bulk upload process has finished
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span className='font-medium text-green-900'>
                    Success: {uploadProgress.successful}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4 text-yellow-600' />
                  <span className='font-medium text-yellow-800'>
                    Duplicates: {uploadProgress.duplicates}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <X className='h-4 w-4 text-red-600' />
                  <span className='font-medium text-red-800'>
                    Failed: {uploadProgress.failed}
                  </span>
                </div>
              </div>

              {uploadProgress.errors.length > 0 && (
                <div className='rounded border border-red-200 bg-red-50 p-3'>
                  <p className='mb-2 text-sm font-medium text-red-900'>
                    Errors encountered ({uploadProgress.errors.length}):
                  </p>
                  <ul className='max-h-40 space-y-1 overflow-y-auto text-xs text-red-800'>
                    {uploadProgress.errors.slice(0, 20).map((error, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-red-500'>•</span>
                        <span className='flex-1'>{error}</span>
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
                excelData.length === 0 ||
                validationErrors.length > 0 ||
                isProcessing
              }
              className='min-w-24'
            >
              {isProcessing ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
