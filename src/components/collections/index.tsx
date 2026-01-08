'use client'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { DataTable } from '@/components/ui/DataTable/data-table'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'

import { useFetchCollections } from '@/utils/hooks/collectionsHooks'
import { collectionColumns } from '@/components/collections/columns'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useSearchParams } from 'next/navigation'

export default function Collections() {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })
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

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const debouncedFilter = useDebouncedValue(columnFilters, 1000)

  const { data: collections, isLoading } = useFetchCollections({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debouncedFilter
  }) as any

  return (
    <>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 text-xl font-semibold'>
              Collections
              {hasPermission(
                MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
                MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions
                  .READ_COLLECTION
              ) && (
                <span className='text-sm text-label'>
                  ({collections?.total ?? 0}){' '}
                </span>
              )}
            </h2>
          </div>
          <div className='flex items-center gap-4'>
            {hasPermission(
              MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
              MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions
                .CREATE_COLLECTION
            ) && (
              <Link
                href={`/collections/new?page=${page || pagination.pageIndex}&limit=${limit || pagination.pageSize}`}
              >
                <Button size={'sm'} className='flex items-center gap-2'>
                  <Plus />
                  Add New
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className='pb-8'>
          {hasPermission(
            MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
            MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions
              .READ_COLLECTION
          ) ? (
            <DataTable
              data={collections?.data ?? []}
              isLoading={isLoading}
              totalRows={collections?.total ?? 0}
              columns={collectionColumns}
              page='collections'
              pagination={pagination}
              setPagination={setPagination}
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              filters={{
                search: {
                  by: 'name',
                  placeholder: 'Search by Collection Name '
                }
              }}
            />
          ) : (
            <div>You don't have access to view collection details!</div>
          )}
        </div>
      </div>
    </>
  )
}
