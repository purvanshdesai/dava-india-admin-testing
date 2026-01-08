'use client'

import { DataTable } from '@/components/ui/DataTable/data-table'
import { AddProductColumns } from '@/components/inventory/AddProduct/AddProductColumns'
import { useEffect, useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'

import { useFetchProductListForInventory } from '@/utils/hooks/inventoryHooks'
import { useDebounce } from '@/utils/hooks/debounce'

export default function AddProduct() {
  const storeId = '6713b6c17e4e5e561d780e04'
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [tableData, setTableData] = useState<any[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const debounceFilter = useDebounce(columnFilters, 1000)
  const { data, isPending, isSuccess } = useFetchProductListForInventory({
    storeId: storeId,
    limit: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize,
    filters: debounceFilter
  })

  useEffect(() => {
    if (isSuccess) {
      const transformedData = data.data.map((d: any) => {
        return {
          _id: d._id,
          product: d
        }
      })
      setTableData(transformedData)
    }
  }, [isSuccess])

  if (isPending) return <div>Loading</div>

  return (
    <div>
      <div className='py-2'>
        <DataTable
          dataState={[tableData, setTableData]}
          totalRows={data?.total ?? 0}
          isLoading={isPending}
          pagination={pagination}
          setPagination={setPagination}
          columns={AddProductColumns}
          page='inventory'
          setColumnFilters={setColumnFilters}
          columnFilters={columnFilters}
          filters={{
            search: {
              by: 'product',
              placeholder: 'Search product name , product code...'
            }
          }}
        />
      </div>
    </div>
  )
}
