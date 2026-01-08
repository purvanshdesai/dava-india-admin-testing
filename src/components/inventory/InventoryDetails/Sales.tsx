'use client'

import React from 'react'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useGetStoreSales } from '@/utils/hooks/inventoryHooks'
import { StoreSalesColumns } from './SalesColumns'
import dayjs from 'dayjs'

export default function SalesTable({ inventoryDetails }: any) {
  const productId = inventoryDetails?.productId?._id

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data: sales, isLoading } = useGetStoreSales(
    {
      $limit: pagination.pageSize,
      $skip: pagination.pageIndex * pagination.pageSize,
      filters: columnFilters
    },
    productId
  )

  const salesRecord = (sales?.data ?? []).map((s: any) => {
    const getItemQuantity = () => {
      const productId = s?.orderItem?.productDetails?._id

      const item = s?.order?.items?.find((p: any) => p.productId === productId)

      return item?.quantity ?? 0
    }

    return {
      ...s,
      orderId: s?.order?.orderId,
      orderDate: dayjs(s.order?.createdAt).format(process.env.DATE_TIME_FORMAT),
      orderMrp: s?.orderItem?.productDetails?.finalPrice,
      orderStatus: s?.order?.status,
      orderQuantity: getItemQuantity(),
      orderTotal:
        (s?.orderItem?.productDetails?.finalPrice ?? 1) *
        (getItemQuantity() ?? 1)
    }
  })

  return (
    <div className=''>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 px-4 md:flex'>
        <div className='flex items-center justify-between space-y-2'></div>
        <div className='pb-8'>
          <DataTable
            data={salesRecord}
            totalRows={sales?.total ? sales?.total : 0}
            isLoading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            columns={StoreSalesColumns}
            page='sales'
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            filters={{
              // categories,
              search: { by: 'orderId', placeholder: 'Search By Order Id' }
            }}
          />
        </div>
      </div>
    </div>
  )
}
