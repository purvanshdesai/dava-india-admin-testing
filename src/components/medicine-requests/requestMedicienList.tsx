'use client'

import React, { useEffect, useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
//import { useDebounce } from '@/utils/hooks/debounce'
import { useFetchMedicineRequests } from '@/utils/hooks/requestMedicineHooks'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { requestMedicineColumns } from './columns'
import { useSearchParams } from 'next/navigation'
import { useExportData } from '@/utils/hooks/exportHooks'
import { downloadFileFromURL } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import moment from 'moment-timezone'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export default function RequestMedicineList() {
  const searchParams = useSearchParams()
  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const { toast } = useToast()

  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isDownloading, setDownloadStatus] = useState(false)
  
  const useDebouncedValue = (inputValue: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(inputValue)

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(inputValue)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [inputValue, delay])

    return debouncedValue
  }

  const debouncedFilter = useDebouncedValue(columnFilters, 800)

  const { data: requests, isLoading } = useFetchMedicineRequests({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debouncedFilter
  })

  const { mutateAsync: exportData } = useExportData()

  const handleDownloadRequestMedicines = async () => {
    try {
      setDownloadStatus(true)
   
      const res = await exportData({
        exportFor: 'medicine-requests',
        filters: {}
      })

      if (!res?.filePath) {
        toast({
          title: 'Download Error',
          description: 'There was an error downloading the medicine requests'
        })
        return
      }

      await downloadFileFromURL(
        res.filePath,
        `Davaindia-medicine-requests-report-${moment().format('DD-MM-YYYY')}.xlsx`
      )
    } catch (e) {
      console.log(e)
      toast({
        title: 'Download Error',
        description: 'There was an error downloading the medicine requests',
        variant: 'destructive'
      })
    } finally {
      setDownloadStatus(false)
    }
  }

  const requestData = requests?.data ?? []

  const searchFilter = Array.isArray(debouncedFilter)
    ? (debouncedFilter as any).find((f: any) => f.id === 'requestedUserId')
    : undefined
  const searchTerm = (searchFilter?.value || '')?.toString().trim().toLowerCase()
  const filtered = searchTerm
    ? (requestData as any[]).filter(item =>
        item?.requestedUserId?.name?.toString().toLowerCase().includes(searchTerm)
      )
    : (requestData as any[])

  const hasReadPermission = hasPermission(
    MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
    MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.READ_MEDICINE_REQUEST
  )

  return (
    <div className='xxl:px-8 flex flex-1 flex-col space-y-8'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-xl font-semibold'>
          Request Medicine
          {hasReadPermission && (
            <span className='text-sm text-label'>
              {' '}({requests?.total ?? filtered.length})
            </span>
          )}
        </h2>
      </div>

      <div className='pb-8'>
        {hasReadPermission ? (
          <DataTable
            data={filtered as any}
            columns={requestMedicineColumns}
            page='medicine-requests'
            filters={{
              search: {
                by: 'requestedUserId',
                placeholder: 'Search by Requester Name ...'
              }
            }}
            totalRows={requests?.total ?? filtered.length}
            isLoading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            downloadRecords={
              hasPermission(
                MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
                MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.DOWNLOAD_MEDICINE_REQUEST
              )
                ? () => handleDownloadRequestMedicines()
                : undefined
            }
            isDownloading={isDownloading}
          />
        ) : (
          <div>You don't have access to view medicine request details!</div>
        )}
      </div>
    </div>
  )
}
