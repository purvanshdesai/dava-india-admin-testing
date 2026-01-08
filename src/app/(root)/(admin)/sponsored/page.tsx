'use client'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { sponsorColumns } from '@/components/sponsored/columns'
import { useFetchSponsors } from '@/utils/hooks/sponsoredHooks'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export default function CouponsPage() {
  const typeFilter: any = [
    { value: 'promotion', label: 'Promotion' },
    { value: 'featured', label: 'Featured' }
  ]
  const activeFilter: any = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ]

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
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

  const { data: sponsors, isLoading } = useFetchSponsors({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debouncedFilter
  })

  return (
    <>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 text-xl font-semibold'>
              Sponsored
              <span className='text-sm text-label'>
                ({sponsors?.total ?? 0}){' '}
              </span>
            </h2>
          </div>
          <div className='flex items-center gap-4'>
            {hasPermission(
              MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
              MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.CREATE_SPONSOR
            ) ? (
              <Link href={'/sponsored/new'}>
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
            MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
            MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.READ_SPONSOR
          ) ? (
            <DataTable
              data={sponsors?.data ? sponsors.data : []}
              columns={sponsorColumns}
              totalRows={sponsors?.total ?? 0}
              page='sponsored'
              isLoading={isLoading}
              pagination={pagination}
              setPagination={setPagination}
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              filters={{
                typeFilter,
                activeFilter,
                search: { by: 'sectionName', placeholder: 'Search Section ...' }
              }}
            />
          ) : (
            <div>You don't have access to view sponsors data!</div>
          )}
        </div>
      </div>
    </>
  )
}
