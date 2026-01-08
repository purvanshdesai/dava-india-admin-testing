'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { storeColumns } from '@/components/category/columns'
import { DataTable } from '@/components/ui/DataTable/data-table'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useGetCategories } from '@/utils/hooks/categoryHook'

export default function Categories() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  const typeFilter: any = [
    { value: 'mainCategory', label: 'Main Category' },
    { value: 'subCategory', label: 'Sub Category' }
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

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const debouncedFilter = useDebouncedValue(columnFilters, 1000)

  const { data: categories, isLoading } = useGetCategories({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debouncedFilter
  }) as any

  return (
    <div>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 text-xl font-semibold'>
              Categories
              <span className='text-sm text-label'>
                ({categories?.total ? categories?.total : 0})
              </span>
            </h2>
          </div>

          <div className='flex items-center gap-4'>
            {/* <Button size={'sm'} className='flex items-center gap-2'>
              <Download />
              Download
            </Button> */}

            <Link href={'/categories/new'}>
              <Button size={'sm'} className='flex items-center gap-2'>
                <Plus />
                Add New
              </Button>
            </Link>
          </div>
        </div>
        <div className=''>
          <DataTable
            data={categories?.data ?? []}
            totalRows={categories?.total ? categories?.total : 0}
            isLoading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            columns={storeColumns}
            page='category'
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            filters={{
              typeFilter,
              search: { by: 'name', placeholder: 'Search Categories ...' }
            }}
          />
        </div>
      </div>
    </div>
  )
}
