'use client'

import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { useState, useEffect } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { zipCodeColumns } from '@/components/zipCodes/columns'
import { useGetZipCodes } from '@/utils/hooks/zipCodeHooks'
import Link from 'next/link'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import AppBreadcrumb from '@/components/Breadcrumb'
import { useSearchParams } from 'next/navigation'
import BulkUploadModal from './BulkUploadModal'

const deliveryStatusFilter: any = [
  { value: true, label: 'Deliverable' },
  { value: false, label: 'Non Deliverable' }
]

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

export default function ZipCodeList() {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const debouncedFilter = useDebouncedValue(columnFilters, 1000)

  const { data: language, isLoading } = useGetZipCodes({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debouncedFilter
  })

  return (
    <div className=''>
      <div className='flex items-center justify-between border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Settings', href: '/settings' },
            { page: 'Zip Code Management', href: '/settings/zipCodes' }
          ]}
        />

        <div>
          {hasPermission(
            MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.key,
            MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.permissions.CREATE_ZIP_CODE
          ) ? (
            <div className='flex items-center gap-4'>
              <Button
                size={'sm'}
                className='flex items-center gap-2'
                onClick={() => setIsBulkUploadOpen(true)}
              >
                <Upload />
                Bulk Upload
              </Button>
              <Link
                href={`/settings/zipCodes/new?page=${pagination.pageIndex}&limit=${pagination.pageSize}`}
              >
                <Button size={'sm'} className='flex items-center gap-2'>
                  <Plus />
                  Add New
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className='hidden h-full flex-1 flex-col space-y-8 pt-4 md:flex'>
        <div className='pb-8'>
          {hasPermission(
            MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.key,
            MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.permissions.READ_ZIP_CODE
          ) ? (
            <DataTable
              data={language?.data ? language?.data : []}
              totalRows={language?.total ? language?.total : 0}
              isLoading={isLoading}
              pagination={pagination}
              setPagination={setPagination}
              columns={zipCodeColumns}
              page='zipCode'
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              filters={{
                deliveryStatusFilter,
                search: {
                  by: 'zipCode',
                  placeholder: 'Search zip code, district, state'
                }
              }}
            />
          ) : (
            <div>You don't have access to view zipcode data!</div>
          )}
        </div>
      </div>

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          // Refresh the data after successful upload
          window.location.reload()
        }}
      />
    </div>
  )
}
