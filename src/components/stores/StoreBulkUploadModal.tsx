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
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import SocketNotificationListener from '@/utils/SocketNotificationListener'

import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Upload,
  X
} from 'lucide-react'

type StoreUploadRow = {
  sourceRow: number
  storeCode: string
  storeName: string
  gstNumber: string
  licenceNumber: string
  fssaiNumber?: string
  email: string
  phoneNumber: string
  address: string
  city: string
  state: string
  pincode: string
  country?: string
  latitude?: number | null
  longitude?: number | null
}

type ServiceableZipRow = {
  sourceRow: number
  storeCode: string
  pincode: string
}

type PharmacistUploadRow = {
  sourceRow: number
  storeCode: string
  name: string
  employeeId: string
  phoneNumber: string
  pin: string
}

type UploadProgress = {
  total: number
  processed: number
  successful: number
  created: number
  updated: number
  skipped: number
  failed: number
  errors: string[]
  isCompleted: boolean
}

interface StoreBulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const NORMALIZE = (value: string | number | null | undefined) =>
  typeof value === 'string'
    ? value.trim()
    : typeof value === 'number'
      ? String(value).trim()
      : ''

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i
const PHONE_REGEX = /^\d{10}$/
const PINCODE_REGEX = /^\d{6}$/

export default function StoreBulkUploadModal({
  isOpen,
  onClose,
  onSuccess
}: StoreBulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [storeRows, setStoreRows] = useState<StoreUploadRow[]>([])
  const [serviceableRows, setServiceableRows] = useState<ServiceableZipRow[]>(
    []
  )
  const [pharmacistRows, setPharmacistRows] = useState<PharmacistUploadRow[]>(
    []
  )
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    isCompleted: false
  })

  const { toast } = useToast()

  const blockingErrors = useMemo(
    () =>
      validationErrors.filter(
        error => !error.toLowerCase().startsWith('notice')
      ),
    [validationErrors]
  )

  const totalStoreTargets = useMemo(() => {
    const codes = new Set<string>()

    storeRows.forEach(row => {
      if (row.storeCode) {
        codes.add(row.storeCode.toLowerCase())
      }
    })

    serviceableRows.forEach(row => {
      if (row.storeCode) {
        codes.add(row.storeCode.toLowerCase())
      }
    })

    pharmacistRows.forEach(row => {
      if (row.storeCode) {
        codes.add(row.storeCode.toLowerCase())
      }
    })

    return codes.size
  }, [storeRows, serviceableRows, pharmacistRows])

  const resetState = useCallback(() => {
    setFile(null)
    setStoreRows([])
    setServiceableRows([])
    setPharmacistRows([])
    setValidationErrors([])
    setIsProcessing(false)
    setUploadProgress({
      total: 0,
      processed: 0,
      successful: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
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
      if (payload?.type === 'store_bulk_upload_progress') {
        const data = payload.data || {}
        setUploadProgress(prev => ({
          ...prev,
          total: data.total ?? prev.total,
          processed: data.processed ?? prev.processed,
          successful: data.successful ?? prev.successful,
          created: data.created ?? prev.created,
          updated: data.updated ?? prev.updated,
          skipped: data.skipped ?? prev.skipped,
          failed: data.failed ?? prev.failed,
          errors: Array.isArray(data.errors) ? data.errors : prev.errors,
          isCompleted: false
        }))
      } else if (payload?.type === 'store_bulk_upload_complete') {
        const data = payload.data || {}
        setUploadProgress(prev => ({
          ...prev,
          total: data.total ?? prev.total,
          processed: data.total ?? prev.total,
          successful: data.successful ?? prev.successful,
          created: data.created ?? prev.created,
          updated: data.updated ?? prev.updated,
          skipped: data.skipped ?? prev.skipped,
          failed: data.failed ?? prev.failed,
          errors: Array.isArray(data.errors) ? data.errors : prev.errors,
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
        socket.on('store_bulk_upload_progress', handleProgressUpdate)
        socket.on('store_bulk_upload_complete', handleProgressUpdate)
        socket.on('store_bulk_upload_error', handleError)
      }
    }

    setupSocketListeners()

    return () => {
      const socket = SocketNotificationListener.socket
      if (socket) {
        socket.off('store_bulk_upload_progress', handleProgressUpdate)
        socket.off('store_bulk_upload_complete', handleProgressUpdate)
        socket.off('store_bulk_upload_error', handleError)
      }
    }
  }, [isProcessing, toast])

  const parseStoresSheet = (
    sheet: XLSX.WorkSheet,
    errors: string[]
  ): StoreUploadRow[] => {
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: ''
    })

    if (rows.length < 2) {
      return []
    }

    const headers = rows[0].map(cell => NORMALIZE(cell).toLowerCase())
    const headerIndex = new Map<string, number>()
    headers.forEach((header, index) => {
      if (header) headerIndex.set(header, index)
    })

    const requiredHeaders = [
      'store code',
      'store name',
      'gst number',
      'licence number',
      'email',
      'phone number',
      'address',
      'city',
      'state',
      'pincode'
    ]

    const missingHeaders = requiredHeaders.filter(
      header => !headerIndex.has(header)
    )
    if (missingHeaders.length > 0) {
      errors.push(
        `Stores sheet is missing required columns: ${missingHeaders.join(', ')}`
      )
      return []
    }

    const duplicateStoreCodes = new Set<string>()
    const duplicateEmails = new Set<string>()
    const seenStoreCodes = new Set<string>()
    const seenEmails = new Set<string>()

    const data: StoreUploadRow[] = []

    const getValue = (row: (string | number)[], header: string) => {
      const index = headerIndex.get(header)
      if (index === undefined) return ''
      return NORMALIZE(row[index])
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every(cell => NORMALIZE(cell) === '')) continue

      const rowNumber = i + 1
      const storeCode = getValue(row, 'store code')
      const storeName = getValue(row, 'store name')
      const gstNumber = getValue(row, 'gst number')
      const licenceNumber = getValue(row, 'licence number')
      const fssaiNumber = getValue(row, 'fssai number') || undefined
      const email = getValue(row, 'email').toLowerCase()
      const phoneNumber = getValue(row, 'phone number')
      const address = getValue(row, 'address')
      const city = getValue(row, 'city')
      const state = getValue(row, 'state')
      const pincode = getValue(row, 'pincode')
      const country = getValue(row, 'country') || 'India'
      const latitudeRaw = getValue(row, 'latitude')
      const longitudeRaw = getValue(row, 'longitude')

      const rowErrors: string[] = []

      if (!storeCode) rowErrors.push('store code is required')
      if (!storeName) rowErrors.push('store name is required')
      if (!gstNumber) rowErrors.push('gst number is required')
      if (!licenceNumber) rowErrors.push('licence number is required')
      if (!email) rowErrors.push('email is required')
      if (email && !EMAIL_REGEX.test(email)) rowErrors.push('email is invalid')
      if (!phoneNumber) rowErrors.push('phone number is required')
      if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
        rowErrors.push('phone number must be 10 digits')
      }
      if (!address) rowErrors.push('address is required')
      if (!city) rowErrors.push('city is required')
      if (!state) rowErrors.push('state is required')
      if (!pincode) rowErrors.push('pincode is required')
      if (pincode && !PINCODE_REGEX.test(pincode)) {
        rowErrors.push('pincode must be 6 digits')
      }

      let latitude: number | null = null
      let longitude: number | null = null

      if (latitudeRaw) {
        const parsed = Number(latitudeRaw)
        if (Number.isFinite(parsed) && parsed >= -90 && parsed <= 90) {
          latitude = parsed
        } else {
          rowErrors.push('latitude must be between -90 and 90')
        }
      }

      if (longitudeRaw) {
        const parsed = Number(longitudeRaw)
        if (Number.isFinite(parsed) && parsed >= -180 && parsed <= 180) {
          longitude = parsed
        } else {
          rowErrors.push('longitude must be between -180 and 180')
        }
      }

      const storeCodeKey = storeCode.toLowerCase()
      const emailKey = email.toLowerCase()

      if (seenStoreCodes.has(storeCodeKey)) {
        duplicateStoreCodes.add(storeCode)
      } else {
        seenStoreCodes.add(storeCodeKey)
      }

      if (seenEmails.has(emailKey)) {
        duplicateEmails.add(email)
      } else {
        seenEmails.add(emailKey)
      }

      if (rowErrors.length > 0) {
        errors.push(
          `Stores sheet row ${rowNumber} (${storeCode || 'N/A'}): ${rowErrors.join(', ')}`
        )
        continue
      }

      data.push({
        sourceRow: rowNumber,
        storeCode,
        storeName,
        gstNumber,
        licenceNumber,
        fssaiNumber,
        email,
        phoneNumber,
        address,
        city,
        state,
        pincode,
        country,
        latitude,
        longitude
      })
    }

    if (duplicateStoreCodes.size > 0) {
      errors.push(
        `Duplicate store codes in Stores sheet: ${Array.from(duplicateStoreCodes).join(', ')}`
      )
    }

    if (duplicateEmails.size > 0) {
      errors.push(
        `Duplicate emails in Stores sheet: ${Array.from(duplicateEmails).join(', ')}`
      )
    }

    return errors.length > 0 ? [] : data
  }

  const parseServiceableSheet = (
    sheet: XLSX.WorkSheet,
    errors: string[],
    {
      knownStoreCodes,
      enforceMatch
    }: { knownStoreCodes: Set<string>; enforceMatch: boolean }
  ): ServiceableZipRow[] => {
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: ''
    })

    if (rows.length < 2) {
      // Allow empty serviceable zip sheet for pharmacist-only uploads
      return []
    }

    const headers = rows[0].map(cell => NORMALIZE(cell).toLowerCase())
    const headerIndex = new Map<string, number>()
    headers.forEach((header, index) => {
      if (header) headerIndex.set(header, index)
    })

    const requiredHeaders = ['store code', 'pincode']
    const missingHeaders = requiredHeaders.filter(
      header => !headerIndex.has(header)
    )

    if (missingHeaders.length > 0) {
      errors.push(
        `Serviceable Zip sheet is missing required columns: ${missingHeaders.join(', ')}`
      )
      return []
    }

    const data: ServiceableZipRow[] = []
    const seenPairs = new Set<string>()

    const getValue = (row: (string | number)[], header: string) => {
      const index = headerIndex.get(header)
      if (index === undefined) return ''
      return NORMALIZE(row[index])
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every(cell => NORMALIZE(cell) === '')) continue

      const rowNumber = i + 1
      const storeCode = getValue(row, 'store code')
      const pincode = getValue(row, 'pincode')

      const rowErrors: string[] = []

      if (!storeCode) rowErrors.push('store code is required')
      if (!pincode) rowErrors.push('pincode is required')
      if (pincode && !PINCODE_REGEX.test(pincode)) {
        rowErrors.push('pincode must be 6 digits')
      }
      if (
        enforceMatch &&
        storeCode &&
        !knownStoreCodes.has(storeCode.toLowerCase())
      ) {
        rowErrors.push('store code not found in Stores sheet')
      }

      const key = `${storeCode.toLowerCase()}-${pincode}`
      if (seenPairs.has(key)) {
        rowErrors.push('duplicate store code and pincode combination')
      } else {
        seenPairs.add(key)
      }

      if (rowErrors.length > 0) {
        errors.push(
          `Serviceable Zip sheet row ${rowNumber} (${storeCode || 'N/A'}): ${rowErrors.join(', ')}`
        )
        continue
      }

      data.push({
        sourceRow: rowNumber,
        storeCode,
        pincode
      })
    }

    return data
  }

  const parsePharmacistSheet = (
    sheet: XLSX.WorkSheet,
    errors: string[],
    {
      knownStoreCodes,
      enforceMatch
    }: { knownStoreCodes: Set<string>; enforceMatch: boolean }
  ): PharmacistUploadRow[] => {
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: ''
    })

    if (rows.length < 2) {
      return []
    }

    const headers = rows[0].map(cell => NORMALIZE(cell).toLowerCase())
    const headerIndex = new Map<string, number>()
    headers.forEach((header, index) => {
      if (header) headerIndex.set(header, index)
    })

    const requiredHeaders = [
      'store code',
      'name',
      'employee id',
      'phone number',
      'pin'
    ]
    const missingHeaders = requiredHeaders.filter(
      header => !headerIndex.has(header)
    )

    if (missingHeaders.length > 0) {
      errors.push(
        `Pharmacist sheet is missing required columns: ${missingHeaders.join(', ')}`
      )
      return []
    }

    const data: PharmacistUploadRow[] = []
    const seenPins = new Set<string>()

    const getValue = (row: (string | number)[], header: string) => {
      const index = headerIndex.get(header)
      if (index === undefined) return ''
      return NORMALIZE(row[index])
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every(cell => NORMALIZE(cell) === '')) continue

      const rowNumber = i + 1
      const storeCode = getValue(row, 'store code')
      const name = getValue(row, 'name')
      const employeeId = getValue(row, 'employee id')
      const phoneNumber = getValue(row, 'phone number')
      const pin = getValue(row, 'pin')

      const rowErrors: string[] = []

      if (!storeCode) rowErrors.push('store code is required')
      if (
        enforceMatch &&
        storeCode &&
        !knownStoreCodes.has(storeCode.toLowerCase())
      ) {
        rowErrors.push('store code not found in Stores sheet')
      }
      if (!name) rowErrors.push('name is required')
      if (!employeeId) rowErrors.push('employee id is required')
      if (!phoneNumber) rowErrors.push('phone number is required')
      if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
        rowErrors.push('phone number must be 10 digits')
      }
      if (!pin) rowErrors.push('pin is required')
      if (pin && pin.length !== 4) {
        rowErrors.push('pin must be 4 characters long')
      }

      if (pin) {
        if (seenPins.has(pin)) {
          rowErrors.push('duplicate pharmacist pin in upload file')
        } else {
          seenPins.add(pin)
        }
      }

      if (rowErrors.length > 0) {
        errors.push(
          `Pharmacist sheet row ${rowNumber} (${storeCode || 'N/A'}): ${rowErrors.join(', ')}`
        )
        continue
      }

      data.push({
        sourceRow: rowNumber,
        storeCode,
        name,
        employeeId,
        phoneNumber,
        pin
      })
    }

    return data
  }

  const processExcelFile = useCallback(async (inputFile: File) => {
    try {
      const data = await inputFile.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })

      if (!workbook.SheetNames.length) {
        setValidationErrors(['Uploaded workbook does not contain any sheets'])
        setStoreRows([])
        setServiceableRows([])
        setPharmacistRows([])
        return
      }

      const normalizeSheetName = (name: string) => name.trim().toLowerCase()
      const sanitizeSheetName = (name: string) =>
        normalizeSheetName(name).replace(/[^a-z0-9]/g, '')

      const findSheetName = (...aliases: string[]) => {
        const enrichedAliases = aliases.map(alias => ({
          original: alias,
          normalized: normalizeSheetName(alias),
          sanitized: sanitizeSheetName(alias)
        }))

        for (const sheetName of workbook.SheetNames) {
          const normalizedSheet = normalizeSheetName(sheetName)
          const sanitizedSheet = sanitizeSheetName(sheetName)

          if (
            enrichedAliases.some(alias => {
              if (!alias.normalized && !alias.sanitized) return false

              return (
                normalizedSheet === alias.normalized ||
                sanitizedSheet === alias.sanitized ||
                normalizedSheet.includes(alias.normalized) ||
                alias.normalized.includes(normalizedSheet) ||
                sanitizedSheet.includes(alias.sanitized) ||
                alias.sanitized.includes(sanitizedSheet)
              )
            })
          ) {
            return sheetName
          }
        }

        return null
      }

      const getSheetHeaders = (sheetName: string | null) => {
        if (!sheetName) return []
        const sheet = workbook.Sheets[sheetName]
        if (!sheet) return []

        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
          header: 1,
          defval: '',
          range: 0
        })

        if (!rows.length) return []

        return rows[0]
          .map(cell => NORMALIZE(cell).toLowerCase())
          .filter(Boolean)
      }

      const findSheetByHeaders = (requiredHeaders: string[]) => {
        for (const sheetName of workbook.SheetNames) {
          const headers = getSheetHeaders(sheetName)
          if (
            requiredHeaders.every(header => headers.includes(header)) &&
            headers.length
          ) {
            return sheetName
          }
        }
        return null
      }

      const currentErrors: string[] = []

      let storesSheetName = findSheetName('stores', 'store')
      if (!storesSheetName) {
        storesSheetName = findSheetByHeaders([
          'store code',
          'store name',
          'gst number',
          'licence number'
        ])
      }
      let parsedStores: StoreUploadRow[] = []
      if (storesSheetName) {
        const storesSheet = workbook.Sheets[storesSheetName]
        const storeErrorsStartIndex = currentErrors.length
        parsedStores = parseStoresSheet(storesSheet, currentErrors)
        const storeErrors = currentErrors.slice(storeErrorsStartIndex)
        const hasBlockingStoreErrors = storeErrors.some(
          error => !error.toLowerCase().startsWith('notice')
        )

        if (hasBlockingStoreErrors) {
          setValidationErrors(currentErrors)
          setStoreRows([])
          setServiceableRows([])
          setPharmacistRows([])
          return
        }

        if (parsedStores.length === 0 && storeErrors.length === 0) {
          currentErrors.push(
            'Notice: Stores sheet does not contain any data rows. Existing stores will be updated when matched via Serviceable Zip or Pharmacist sheets.'
          )
        }
      } else {
        currentErrors.push(
          'Notice: Stores sheet not found. Existing stores will be updated where possible.'
        )
      }

      const knownStoreCodes = new Set(
        parsedStores
          .map(store => store.storeCode?.toLowerCase())
          .filter((code): code is string => Boolean(code))
      )
      const enforceStoreMatch = parsedStores.length > 0

      const serviceableSheetName =
        findSheetName(
          'serviceable zip',
          'serviceable pincodes',
          'pincode',
          'pincodes',
          'zip codes',
          'zipcodes'
        ) || findSheetByHeaders(['store code', 'pincode'])

      let parsedServiceable: ServiceableZipRow[] = []
      if (serviceableSheetName) {
        const serviceableSheet = workbook.Sheets[serviceableSheetName]
        parsedServiceable = parseServiceableSheet(
          serviceableSheet,
          currentErrors,
          {
            knownStoreCodes,
            enforceMatch: enforceStoreMatch
          }
        )
      } else {
        currentErrors.push(
          'Notice: Serviceable Zip sheet not found. Existing stores will be updated where possible.'
        )
      }

      const pharmacistSheetName =
        findSheetName('pharmacist', 'pharmacists', 'pharmacist details') ||
        findSheetByHeaders(['store code', 'pin', 'employee id'])

      let parsedPharmacists: PharmacistUploadRow[] = []
      if (pharmacistSheetName) {
        const pharmacistSheet = workbook.Sheets[pharmacistSheetName]
        parsedPharmacists = parsePharmacistSheet(
          pharmacistSheet,
          currentErrors,
          {
            knownStoreCodes,
            enforceMatch: enforceStoreMatch
          }
        )
      } else {
        currentErrors.push(
          'Notice: Pharmacist sheet not found. Pharmacist updates will be skipped.'
        )
      }

      setStoreRows(parsedStores)
      setServiceableRows(parsedServiceable)
      setPharmacistRows(parsedPharmacists)
      setValidationErrors(currentErrors)
    } catch (error) {
      setStoreRows([])
      setServiceableRows([])
      setPharmacistRows([])
      setValidationErrors([
        'Failed to process Excel file. Please check the template and try again.'
      ])
    }
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const [excelFile] = acceptedFiles
      if (excelFile) {
        setFile(excelFile)
        setValidationErrors([])
        setStoreRows([])
        setServiceableRows([])
        setPharmacistRows([])
        processExcelFile(excelFile)
      }
    },
    [processExcelFile]
  )

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

  const progressPercentage = useMemo(() => {
    return uploadProgress.total > 0
      ? (uploadProgress.processed / uploadProgress.total) * 100
      : 0
  }, [uploadProgress])

  const handleUpload = async () => {
    // Allow upload if either serviceable rows or pharmacist rows are present
    if (serviceableRows.length === 0 && pharmacistRows.length === 0) {
      toast({
        title: 'Validation error',
        description:
          'Please provide at least Serviceable Zip data or Pharmacist data to upload'
      })
      return
    }

    if (blockingErrors.length > 0) {
      toast({
        title: 'Validation error',
        description: 'Please resolve validation errors before uploading'
      })
      return
    }

    const initialTotal =
      totalStoreTargets > 0 ? totalStoreTargets : serviceableRows.length

    setIsProcessing(true)
    setUploadProgress({
      total: initialTotal,
      processed: 0,
      successful: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      isCompleted: false
    })

    try {
      if (!SocketNotificationListener.isInitialized) {
        await SocketNotificationListener.initialize()
      }

      if (!SocketNotificationListener.isSocketReady()) {
        await new Promise((resolve, reject) => {
          const socket = SocketNotificationListener.socket
          if (!socket) {
            reject(new Error('Socket connection not available'))
            return
          }

          const timeout = setTimeout(() => {
            reject(new Error('Socket connection timeout'))
          }, 5000)

          socket.once('connect', () => {
            clearTimeout(timeout)
            resolve(true)
          })

          socket.once('connect_error', (err: any) => {
            clearTimeout(timeout)
            reject(err)
          })
        })
      }

      if (SocketNotificationListener.isSocketReady()) {
        SocketNotificationListener.socket.emit('start_store_bulk_upload', {
          stores: storeRows,
          serviceableZip: serviceableRows,
          pharmacists: pharmacistRows
        })
      } else {
        throw new Error(
          'Socket connection not available. Please refresh and try again.'
        )
      }
    } catch (error: any) {
      setIsProcessing(false)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to start bulk upload'
      })
    }
  }

  const handleUploadComplete = () => {
    if (uploadProgress.successful > 0) {
      toast({
        title: 'Success',
        description: `Bulk upload completed. ${uploadProgress.created} created, ${uploadProgress.updated} updated, ${uploadProgress.skipped} skipped.`
      })
      onSuccess?.()
    } else {
      toast({
        title: 'Bulk upload finished',
        description:
          'No store records were processed successfully. Please review the error report.'
      })
    }
    handleClose()
  }

  const downloadTemplate = () => {
    if (typeof window !== 'undefined') {
      window.open('/excel/store-bulk-upload-template.xlsx', '_blank')
    }
  }

  const hasDataReady =
    (serviceableRows.length > 0 || pharmacistRows.length > 0) &&
    blockingErrors.length === 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[94vh] max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Bulk Upload Stores
          </DialogTitle>
        </DialogHeader>

        <div className='max-h-[85vh] space-y-6 overflow-y-auto'>
          <div className='flex items-center justify-between rounded-lg bg-blue-50 p-4'>
            <div>
              <h4 className='font-medium text-blue-900'>Download Template</h4>
              <p className='text-sm text-blue-700'>
                Ensure the upload file follows the latest template
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
              <p className='mb-4 text-sm text-gray-500'>
                or click to browse (xlsx, xls)
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
                  resetState()
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
                <div className='space-y-2'>
                  <p className='font-medium text-red-900'>Validation Issues</p>
                  <ScrollArea className='h-32 pr-2'>
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

          {hasDataReady && (
            <div className='grid gap-4 lg:grid-cols-2'>
              <div className='rounded-lg border bg-white p-4 shadow-sm'>
                <div className='mb-3 flex items-center justify-between'>
                  <h4 className='font-medium'>Stores</h4>
                  <Badge variant='secondary'>{storeRows.length} rows</Badge>
                </div>
                {storeRows.length === 0 ? (
                  <p className='rounded border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500'>
                    No store rows provided. Existing stores will be updated when
                    possible.
                  </p>
                ) : (
                  <div className='max-h-60 overflow-auto rounded border'>
                    <Table>
                      <TableHeader className='bg-gray-50'>
                        <TableRow>
                          <TableHead>Store Code</TableHead>
                          <TableHead>Store Name</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>State</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {storeRows.slice(0, 8).map((row, index) => (
                          <TableRow key={`${row.storeCode}-${index}`}>
                            <TableCell className='font-mono text-sm'>
                              {row.storeCode}
                            </TableCell>
                            <TableCell className='max-w-[180px] truncate'>
                              {row.storeName}
                            </TableCell>
                            <TableCell>{row.city}</TableCell>
                            <TableCell>{row.state}</TableCell>
                          </TableRow>
                        ))}
                        {storeRows.length > 8 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className='bg-gray-50 text-center text-sm text-gray-500'
                            >
                              ... and {storeRows.length - 8} more stores
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className='grid gap-4'>
                <div className='rounded-lg border bg-white p-4 shadow-sm'>
                  <div className='mb-3 flex items-center justify-between'>
                    <h4 className='font-medium'>Serviceable Pincodes</h4>
                    <Badge variant='outline'>
                      {serviceableRows.length} rows
                    </Badge>
                  </div>
                  <div className='max-h-28 overflow-auto rounded border'>
                    <Table>
                      <TableHeader className='bg-gray-50'>
                        <TableRow>
                          <TableHead>Store Code</TableHead>
                          <TableHead>Pincode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceableRows.slice(0, 10).map((row, index) => (
                          <TableRow
                            key={`${row.storeCode}-${row.pincode}-${index}`}
                          >
                            <TableCell className='font-mono text-sm'>
                              {row.storeCode}
                            </TableCell>
                            <TableCell>{row.pincode}</TableCell>
                          </TableRow>
                        ))}
                        {serviceableRows.length > 10 && (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className='bg-gray-50 text-center text-sm text-gray-500'
                            >
                              ... and {serviceableRows.length - 10} more entries
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className='rounded-lg border bg-white p-4 shadow-sm'>
                  <div className='mb-3 flex items-center justify-between'>
                    <h4 className='font-medium'>Pharmacists</h4>
                    <Badge variant='secondary'>
                      {pharmacistRows.length} rows
                    </Badge>
                  </div>
                  {pharmacistRows.length === 0 ? (
                    <p className='text-sm text-gray-500'>
                      No pharmacist records provided (optional).
                    </p>
                  ) : (
                    <div className='max-h-28 overflow-auto rounded border'>
                      <Table>
                        <TableHeader className='bg-gray-50'>
                          <TableRow>
                            <TableHead>Store Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pharmacistRows.slice(0, 6).map((row, index) => (
                            <TableRow
                              key={`${row.storeCode}-${row.employeeId}-${index}`}
                            >
                              <TableCell className='font-mono text-sm'>
                                {row.storeCode}
                              </TableCell>
                              <TableCell className='max-w-[160px] truncate'>
                                {row.name}
                              </TableCell>
                              <TableCell>{row.phoneNumber}</TableCell>
                            </TableRow>
                          ))}
                          {pharmacistRows.length > 6 && (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className='bg-gray-50 text-center text-sm text-gray-500'
                              >
                                ... and {pharmacistRows.length - 6} more
                                pharmacists
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isProcessing && !uploadProgress.isCompleted && (
            <div className='space-y-3 rounded-lg border bg-white p-4 shadow-sm'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Upload Progress</h4>
                <span className='text-sm text-gray-600'>
                  {uploadProgress.processed} / {uploadProgress.total}
                </span>
              </div>
              <Progress value={progressPercentage} className='h-2' />
              <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                <div className='flex items-center gap-2 text-green-700'>
                  <CheckCircle className='h-4 w-4' />
                  <span>Created: {uploadProgress.created}</span>
                </div>
                <div className='flex items-center gap-2 text-blue-700'>
                  <CheckCircle className='h-4 w-4' />
                  <span>Updated: {uploadProgress.updated}</span>
                </div>
                <div className='flex items-center gap-2 text-yellow-700'>
                  <AlertCircle className='h-4 w-4' />
                  <span>Skipped: {uploadProgress.skipped}</span>
                </div>
                <div className='flex items-center gap-2 text-red-700'>
                  <X className='h-4 w-4' />
                  <span>Failed: {uploadProgress.failed}</span>
                </div>
              </div>
            </div>
          )}

          {uploadProgress.isCompleted && (
            <div className='space-y-4 rounded-lg border border-green-200 bg-green-50 p-6'>
              <div className='flex items-center gap-3'>
                <CheckCircle className='h-8 w-8 text-green-600' />
                <div>
                  <h4 className='text-lg font-semibold text-green-900'>
                    Upload Completed
                  </h4>
                  <p className='text-sm text-green-700'>
                    Bulk upload process has finished.
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                <div className='flex items-center gap-2 text-green-800'>
                  <CheckCircle className='h-4 w-4' />
                  <span className='font-medium'>
                    Created: {uploadProgress.created}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-blue-800'>
                  <CheckCircle className='h-4 w-4' />
                  <span className='font-medium'>
                    Updated: {uploadProgress.updated}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-yellow-700'>
                  <AlertCircle className='h-4 w-4' />
                  <span className='font-medium'>
                    Skipped: {uploadProgress.skipped}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-red-700'>
                  <X className='h-4 w-4' />
                  <span className='font-medium'>
                    Failed: {uploadProgress.failed}
                  </span>
                </div>
              </div>

              {uploadProgress.errors.length > 0 && (
                <div className='rounded border border-red-200 bg-red-50 p-3'>
                  <p className='mb-2 text-sm font-medium text-red-900'>
                    Errors ({uploadProgress.errors.length}):
                  </p>
                  <ScrollArea className='h-32 pr-2'>
                    <ul className='space-y-1 text-xs text-red-800'>
                      {uploadProgress.errors
                        .slice(0, 40)
                        .map((error, index) => (
                          <li key={index} className='flex items-start gap-2'>
                            <span className='text-red-500'>•</span>
                            <span className='flex-1'>{error}</span>
                          </li>
                        ))}
                      {uploadProgress.errors.length > 40 && (
                        <li className='font-medium text-red-600'>
                          ... and {uploadProgress.errors.length - 40} more
                          errors
                        </li>
                      )}
                    </ul>
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
                disabled={!hasDataReady || isProcessing}
                className='min-w-24'
              >
                {isProcessing ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
