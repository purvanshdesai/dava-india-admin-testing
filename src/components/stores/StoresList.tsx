'use client'

import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { storeColumns } from '@/components/stores/columns'
import { DataTable } from '@/components/ui/DataTable/data-table'
import Link from 'next/link'
import { useGetStores } from '@/utils/hooks/storeHooks'
import { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useDebounce } from '@/utils/hooks/debounce'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useSearchParams } from 'next/navigation'
import { IndianStates } from '@/utils/utils/constants'
import StoreBulkUploadModal from '@/components/stores/StoreBulkUploadModal'

const storeStatusFilter: any = [
  { value: true, label: 'Active' },
  { value: false, label: 'Not Active' }
]
const storeToggleStatusFilter: any = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inctive' }
]

const stateFilter = (IndianStates ?? []).map(state => {
  return { value: state.name, label: state.name }
})

export default function StoresList() {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)

  const debounceFilter = useDebounce(columnFilters, 1000)

  const { data, isLoading } = useGetStores({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debounceFilter
  })

  return (
    <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>
            Stores{' '}
            {hasPermission(
              MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
              MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.READ_STORE
            ) && (
              <span className='text-sm text-label'>
                ({data?.total ? data?.total : 0})
              </span>
            )}
          </h2>
        </div>

        <div className='flex items-center gap-4'>
          {hasPermission(
            MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
            MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.CREATE_STORE
          ) ? (
            <Button
              size={'sm'}
              variant='outline'
              className='flex items-center gap-2'
              onClick={() => setIsBulkUploadOpen(true)}
            >
              <Upload className='h-4 w-4' />
              Bulk Upload
            </Button>
          ) : null}
          {hasPermission(
            MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
            MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.CREATE_STORE
          ) ? (
            <Link
              href={`/stores/new?page=${pagination.pageIndex}&limit=${pagination.pageSize}`}
            >
              <Button size={'sm'} className='flex items-center gap-2'>
                <Plus />
                Add New
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
      <div className='pb-8'>
        {hasPermission(
          MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
          MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.READ_STORE
        ) ? (
          <DataTable
            data={data?.data ? data?.data : []}
            totalRows={data?.total ? data?.total : 0}
            isLoading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            columns={storeColumns}
            page='stores'
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            filters={{
              storeStatusFilter,
              storeToggleStatusFilter,
              stateFilter: stateFilter,
              search: {
                by: 'storeName',
                placeholder: 'Search stores name, zipcode...'
              }
            }}
          />
        ) : (
          <div>You don't have access to see the store details</div>
        )}
      </div>

      <StoreBulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          setIsBulkUploadOpen(false)
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }}
      />
    </div>
  )
}
