'use client'

import React, { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useDebounce } from '@/utils/hooks/debounce'
import { useFetchUsers } from '@/utils/hooks/userHooks'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { consumerColumns } from './columns'
import { useSearchParams } from 'next/navigation'
import { useExportData } from '@/utils/hooks/exportHooks'
import { downloadFileFromURL } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import moment from 'moment-timezone'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export default function ConsumersList() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const debounceFilter = useDebounce(columnFilters, 500)

  const [isDownloading, setDownloadStatus] = useState(false)

  const { data: users, isLoading } = useFetchUsers({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debounceFilter
  })

  const { mutateAsync: exportData } = useExportData()

  const handleDownloadConsumers = async () => {
    try {
      setDownloadStatus(true)
      const res = await exportData({
        exportFor: 'customers',
        filters: {}
      })

      if (!res?.filePath) {
        toast({
          title: 'Download Error',
          description: 'There was an error downloading the consumers list'
        })
        return
      }

      await downloadFileFromURL(
        res.filePath,
        `Davaindia-consumers-report-${moment().format('DD-MM-YYYY')}.xlsx`
      )
    } catch (e) {
      console.log(e)
      toast({
        title: 'Download Error',
        description: 'There was an error downloading the consumers list',
        variant: 'destructive'
      })
    } finally {
      setDownloadStatus(false)
    }
  }

  const hasReadPermission = hasPermission(
    MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
    MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.READ_CUSTOMER
  )

  return (
    <div className='xxl:px-8 flex flex-1 flex-col space-y-8'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-xl font-semibold'>
          Consumers
          {hasReadPermission && (
            <span className='text-sm text-label'> ({users?.total ?? 0})</span>
          )}
        </h2>
      </div>

      <div className='pb-8'>
        {hasReadPermission ? (
          <DataTable
            data={users?.data}
            columns={consumerColumns}
            page='consumers'
            filters={{
              search: { by: 'name', placeholder: 'Search consumers...' }
            }}
            totalRows={users?.total ?? 0}
            isLoading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            downloadRecords={
              hasPermission(
                MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
                MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions
                  .DOWNLOAD_CUSTOMER
              )
                ? () => handleDownloadConsumers()
                : undefined
            }
            isDownloading={isDownloading}
          />
        ) : (
          <div>You don't have access to view customer details!</div>
        )}
      </div>
    </div>
  )
}
