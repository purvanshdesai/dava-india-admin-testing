'use client'

// import { Button } from '@/components/ui/button'
// import { Download } from 'lucide-react'

import { DataTable } from '@/components/ui/DataTable/data-table'

import { useState } from 'react'
import { ColumnFiltersState, PaginationState } from '@tanstack/react-table'

import { useGetStoreAdminOrders } from '@/utils/hooks/storeAdminOrder'
import { OrderStoreAdminColumns } from '@/components/storeAdmin/orders/columns'
// import { handleGetOrdersDownload } from '@/utils/actions/storeAdminOrders'
import { useDebounce } from '@/utils/hooks/debounce'
import { playNotificationSound } from '@/lib/notificationAlert'

const orderStatusFilters: any = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' }
]

export default function StoreOrders() {
  const [pagination, setPagination] = useState<
    PaginationState & { _key?: number }
  >({
    pageIndex: 0,
    pageSize: 10,
    _key: 0
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const debounceFilter = useDebounce(columnFilters, 1000)

  const { data: orders, isLoading } = useGetStoreAdminOrders({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debounceFilter,
    _key: pagination._key
  })

  // const downloadExcel = async () => {
  //   const response: any = await handleGetOrdersDownload({
  //     $limit: pagination.pageSize,
  //     $skip: pagination.pageIndex * pagination.pageSize,
  //     filters: columnFilters
  //   })
  //   if (response && response.downloadLink) {
  //     const link = document.createElement('a')
  //     link.href = response.downloadLink
  //     document.body.appendChild(link)
  //     link.click()
  //     document.body.removeChild(link)
  //   } else {
  //     console.error('Failed to download the Excel file.')
  //   }
  // }
  return (
    <div className=''>
      <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2
              className='flex items-center gap-1 text-xl font-semibold'
              onClick={() => playNotificationSound()}
            >
              Orders
              <span className='text-sm text-label'>
                ({orders?.total ? orders?.total : 0})
              </span>
            </h2>
          </div>

          {/*<div className='flex items-center gap-4'>*/}
          {/*  <Button*/}
          {/*    size={'sm'}*/}
          {/*    className='flex items-center gap-2'*/}
          {/*    onClick={downloadExcel}*/}
          {/*  >*/}
          {/*    <Download />*/}
          {/*    Download*/}
          {/*  </Button>*/}
          {/*</div>*/}
        </div>
        <div className='pb-8'>
          <DataTable
            data={orders ? orders?.data : []}
            totalRows={orders?.total ? orders?.total : 0}
            isLoading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            columns={OrderStoreAdminColumns}
            page='orders'
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            filters={{
              orderStatusFilters,
              search: {
                by: 'orderId',
                placeholder: 'Search By Order Id,Customer email, Customer name'
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
