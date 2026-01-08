import { useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import { useDebounce } from '@/utils/hooks/debounce'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { ticketsTableColumns } from '@/components/inquiry/tickets/columns'
import { useFetchTickets } from '@/utils/hooks/ticketHooks'
import DownloadButton from '@/components/inquiry/tickets/DownloadButton'
import { DateRange } from 'react-day-picker'

export default function TicketsList() {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<
    PaginationState & { _key?: number }
  >({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10,
    _key: 0
  })

  // Date range state for filtering tickets
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [dateFilterType, setDateFilterType] = useState<string>('all')

  const debounceFilter = useDebounce(columnFilters, 1000)

  // Debounce date inputs
  const debouncedDateRange = useDebounce(dateRange, 600)
  const debouncedDateFilterType = useDebounce(dateFilterType, 600)

  // Refresh when date filters change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: 0,
      _key: Date.now()
    }))
  }, [debouncedDateRange, debouncedDateFilterType])

  const { data: tickets, isPending } = useFetchTickets({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    _key: pagination._key,
    filters: debounceFilter,
    dateRange: debouncedDateRange,
    dateFilterType: debouncedDateFilterType
  })

  const statusFilter: any = [
    { value: 'open', label: 'Open' },
    { value: 'reopen', label: 'Re-Open' },
    { value: 'closed', label: 'Closed' }
  ]

  const issueFilter: any = [
    { value: 'prescription-upload', label: 'Prescription upload' },
    { value: 'doctor-consultation', label: 'Doctor Consultation' },
    { value: 'damaged-product', label: 'In transit damaged' },
    {
      value: 'wrong-item',
      label: 'Received items different from the order placed'
    },
    { value: 'expired', label: 'Received nearby or expired product' },
    {
      value: 'admin-partial-order-cancellation-request',
      label: 'Admin Partial cancellation request'
    }
  ]

  return (
    <>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 text-xl font-semibold'>
              All Issues
              <span className='text-sm text-label'>
                ({tickets?.total || 0})
              </span>
            </h2>
          </div>
          {hasPermission(
            MODULES_PERMISSIONS.TICKET_MANAGEMENT.key,
            MODULES_PERMISSIONS.TICKET_MANAGEMENT.permissions.DOWNLOAD_TICKET
          ) && (
            <div>
              <DownloadButton
                columnFilters={columnFilters}
                dateRange={debouncedDateRange}
                dateFilterType={debouncedDateFilterType}
              />
            </div>
          )}
        </div>
        <div className='pb-8'>
          {hasPermission(
            MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
            MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.READ_PRODUCT
          ) || true ? (
            <DataTable
              data={tickets?.data}
              columns={ticketsTableColumns}
              page='inquiry'
              filters={{
                statusFilter,
                issueFilter,
                search: {
                  by: 'ticketId',
                  placeholder: 'Search by ticket no or order no...'
                }
              }}
              totalRows={tickets?.total}
              isLoading={isPending}
              pagination={pagination}
              setPagination={setPagination}
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              dateRange={dateRange}
              setDateRange={setDateRange}
              dateFilterType={dateFilterType}
              setDateFilterType={setDateFilterType}
            />
          ) : (
            <div>You don't have access to view the product details!</div>
          )}
        </div>
      </div>
    </>
  )
}
