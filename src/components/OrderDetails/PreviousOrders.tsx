'use client'

import { OrderColumns } from '@/components/orders/columns'
import {
  davaOneMembershipFilters,
  deliveryModeFilters,
  orderPaymentMethodFilters,
  orderStatusFilters,
  orderTrackingStatus
} from '@/components/orders/utils'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { useDebounce } from '@/utils/hooks/debounce'
import { useGetOrders } from '@/utils/hooks/orderHooks'
import { useGetStoreAdminOrders } from '@/utils/hooks/storeAdminOrder'
import { ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import { useState } from 'react'

interface PreviousOrdersProps {
  userId: string
  currentOrderId: string
  isStoreAdmin?: boolean
}

export default function PreviousOrders({
  userId,
  currentOrderId,
  isStoreAdmin
}: PreviousOrdersProps) {
  const [pagination, setPagination] = useState<
    PaginationState & { _key?: number }
  >({
    pageIndex: 0,
    pageSize: 10,
    _key: 0
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const debounceFilter = useDebounce(columnFilters, 1000)

  const ordersHook = isStoreAdmin ? useGetStoreAdminOrders : useGetOrders

  const { data: orders, isLoading } = ordersHook({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    _key: pagination._key,
    filters: debounceFilter,
    userId: userId,
    excludeOrderId: currentOrderId
  })

  return (
    <div className='border-t py-9'>
      <div className='mb-6 text-xl font-semibold'>Previous Orders</div>
      <div className='pb-8'>
        <DataTable
          data={orders ? orders?.data : []}
          totalRows={orders?.total ? orders?.total : 0}
          isLoading={isLoading}
          pagination={pagination}
          setPagination={setPagination}
          columns={OrderColumns}
          page='previous-orders'
          setColumnFilters={setColumnFilters}
          columnFilters={columnFilters}
          filters={{
            orderStatusFilters,
            orderPaymentMethodFilters,
            orderTrackingStatus,
            deliveryModeFilters,
            davaOneMembershipFilters,
            search: {
              by: 'orderId',
              placeholder: 'Search by order Id...'
            }
          }}
        />
      </div>
    </div>
  )
}
