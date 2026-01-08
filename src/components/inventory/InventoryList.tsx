'use client'

import { Button } from '@/components/ui/button'
import { FileUp, SquarePlus } from 'lucide-react'
import { inventoryColumns } from '@/components/inventory/columns'
import { DataTable } from '@/components/ui/DataTable/data-table'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useFetchInventory } from '@/utils/hooks/inventoryHooks'

export default function InventoryList() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  const [tableData, setTableData] = useState<any[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data, isLoading } = useFetchInventory({
    limit: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize,
    filters: columnFilters
  })

  useEffect(() => {
    if (!data) return

    const transformedData = data.data.map((d: any) => {
      return {
        _id: d._id,
        product: {
          _id: d.productDetails?._id,
          name: d.productDetails?.title,
          images: d.productDetails?.images?.map((i: any) => i.objectUrl),
          description: d.productDetails?.description
        },
        category: d.productDetails?.subCategory?.length
          ? d.productDetails?.subCategory[0].name
          : '--',
        stock: d.stock,
        addedBy: d.createdByUserDetails?.fullName ?? '--'
      }
    })
    setTableData(transformedData)
  }, [data])

  return (
    <div>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 text-xl font-semibold'>
              Inventory
              <span className='text-sm text-label'>
                ({data?.total ? data?.total : 0})
              </span>
            </h2>
          </div>

          <div className='flex items-center gap-4'>
            <Link href={'/store/inventory/bulk-upload'}>
              <Button
                variant={'outline'}
                size={'sm'}
                className='flex items-center gap-2 text-primary'
              >
                <FileUp height={18} />
                Bulk Upload Inventory
              </Button>
            </Link>
            <Link href={'/store/inventory/add-product'}>
              <Button size={'sm'} className='flex items-center gap-2'>
                <SquarePlus height={18} />
                Add New
              </Button>
            </Link>
          </div>
        </div>
        <div className=''>
          <DataTable
            data={tableData}
            totalRows={data?.total ? data?.total : 0}
            isLoading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            columns={inventoryColumns}
            page='category'
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            filters={{
              // categories,
              search: { by: 'product', placeholder: 'Search Products ...' }
            }}
          />
        </div>
      </div>
    </div>
  )
}
