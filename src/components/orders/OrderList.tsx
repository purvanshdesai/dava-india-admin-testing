'use client'

import { OrderColumns } from '@/components/orders/columns'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { Suspense, useState, useEffect } from 'react'
import { ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import { useGetOrders } from '@/utils/hooks/orderHooks'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useDebounce } from '@/utils/hooks/debounce'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { playNotificationSound } from '@/lib/notificationAlert'
import { downloadFileFromURL } from '@/lib/utils'
import { useExportData } from '@/utils/hooks/exportHooks'
import moment from 'moment-timezone'
import { DateRange } from 'react-day-picker'
import {
  orderTrackingStatus,
  deliveryModeFilters,
  orderStatusFilters,
  orderPaymentMethodFilters,
  davaOneMembershipFilters
} from './utils'

export default function OrdersList() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [pagination, setPagination] = useState<
    PaginationState & { _key?: number }
  >({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10,
    _key: 0
  })
  const [isDownloading, setDownloadStatus] = useState(false)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    // {
    //   id: 'status',
    //   value: ['paid']
    // }
  ])

  // Date range state for filtering orders
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [dateFilterType, setDateFilterType] = useState<string>('all')

  const debounceFilter = useDebounce(columnFilters, 1000)

  // ✅ Debounce both date inputs
  const debouncedDateRange = useDebounce(dateRange, 600)
  const debouncedDateFilterType = useDebounce(dateFilterType, 600)

  // Refresh only when the debounced values (and debounced column filters) change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: 0, // optional: reset to first page on filter change
      _key: Date.now()
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDateRange, debouncedDateFilterType])

  const { data: orders, isLoading } = useGetOrders({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    _key: pagination._key,
    filters: debounceFilter, // your existing debounced columnFilters
    dateRange: debouncedDateRange, // ✅ use debounced
    dateFilterType: debouncedDateFilterType // ✅ use debounced
  })

  const { mutateAsync: exportData } = useExportData()

  const handleDownloadOrders = async () => {
    try {
      setDownloadStatus(true)
      const res = await exportData({
        exportFor: 'orders',
        filters: {
          dateRange: debouncedDateRange,
          dateFilterType: debouncedDateFilterType,
          columnFilters: debounceFilter
        }
      })

      if (!res?.filePath) {
        toast({
          title: 'Download Error',
          description: 'There was an error downloading the orders'
        })
        return
      }

      await downloadFileFromURL(
        res.filePath,
        `Davaindia-orders-report-${moment().format('DD-MM-YYYY')}.xlsx`
      )
    } catch (e) {
      console.log(e)
    } finally {
      setDownloadStatus(false)
    }
  }

  const useOrderPermissions = () => {
    const canReadOrders = hasPermission(
      MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
      MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.READ_ORDER
    )

    const canDownloadOrders = hasPermission(
      MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
      MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.DOWNLOAD_ORDER
    )

    return { canReadOrders, canDownloadOrders }
  }

  const perms = useOrderPermissions()

  return (
    <Suspense>
      <div className=''>
        <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
          <div className='flex items-center justify-between space-y-2'>
            <div onClick={() => playNotificationSound()}>
              <h2 className='flex items-center gap-1 text-xl font-semibold'>
                Orders
                {perms?.canReadOrders && (
                  <span className='text-sm text-label'>
                    ({orders?.total ? orders?.total : 0})
                  </span>
                )}
              </h2>
            </div>

            <div className='flex items-center gap-4'>
              {/* {hasPermission(
              MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
              MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.DOWNLOAD_ORDERS
            ) ? (
              <Button size={'sm'} className='flex items-center gap-2'>
                <Download />
                Download
              </Button>
            ) : null} */}
            </div>
          </div>
          <div className='pb-8'>
            {perms?.canReadOrders ? (
              <DataTable
                data={orders ? orders?.data : []}
                totalRows={orders?.total ? orders?.total : 0}
                isLoading={isLoading}
                pagination={pagination}
                setPagination={setPagination}
                columns={OrderColumns}
                page='orders'
                setColumnFilters={setColumnFilters}
                columnFilters={columnFilters}
                downloadRecords={
                  perms?.canDownloadOrders
                    ? () => handleDownloadOrders()
                    : undefined
                }
                isDownloading={isDownloading}
                filters={{
                  orderStatusFilters,
                  orderPaymentMethodFilters,
                  orderTrackingStatus,
                  deliveryModeFilters,
                  davaOneMembershipFilters,
                  search: {
                    by: 'orderId',
                    placeholder:
                      'Search by order Id, customer email/phone, store code/name...'
                  }
                }}
                dateRange={dateRange}
                setDateRange={setDateRange}
                dateFilterType={dateFilterType}
                setDateFilterType={setDateFilterType}
              />
            ) : (
              <div>You don't have access to view the orders!</div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  )
}
