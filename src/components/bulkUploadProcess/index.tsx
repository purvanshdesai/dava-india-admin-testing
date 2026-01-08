'use client'
import React, { useState } from 'react'
import { TaxesColumns } from './columns'
import { DataTable } from '../ui/DataTable/data-table'
import { useGetBulkUploadProcess } from '@/utils/hooks/bulkUploadProcessHook'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { RefreshCwIcon } from 'lucide-react'

const BulkUploadProcessTable = () => {
  const router = useRouter()
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [columnFilters, setColumnFilters] = useState<any>([])
  const [timestamp, setTimeStamp] = useState<any>(new Date().getTime())

  const { data: bulkUploads, isLoading }: any = useGetBulkUploadProcess({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: columnFilters,
    timestamp
  })

  return (
    <div>
      <div className=''>
        <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
          <div className='flex items-center justify-end gap-4'>
            <Button
              onClick={() => setTimeStamp(new Date().getTime())}
              variant={'outline'}
              size={'sm'}
            >
              <RefreshCwIcon />
            </Button>
            {hasPermission(
              MODULES_PERMISSIONS.INVENTORY_MANAGEMENT.key,
              MODULES_PERMISSIONS.INVENTORY_MANAGEMENT.permissions
                .CREATE_INVENTORY
            ) && (
              <div className='flex items-center gap-4'>
                <Button onClick={() => router.push('/inventory/upload')}>
                  Add bulk upload
                </Button>
              </div>
            )}
          </div>
          {hasPermission(
            MODULES_PERMISSIONS.INVENTORY_MANAGEMENT.key,
            MODULES_PERMISSIONS.INVENTORY_MANAGEMENT.permissions.VIEW_INVENTORY
          ) ? (
            <div className='pb-8'>
              <DataTable
                data={bulkUploads?.data}
                totalRows={bulkUploads?.total}
                isLoading={isLoading}
                pagination={pagination}
                setPagination={setPagination}
                columns={TaxesColumns}
                page='Tax'
                setColumnFilters={setColumnFilters}
                columnFilters={columnFilters}
                filters={{}}
              />
            </div>
          ) : (
            <div>You don't have access to to read Inventory!</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BulkUploadProcessTable
