'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '@/components/ui/DataTable/data-table-view-options'
import { DataTableFacetedFilter } from '@/components/ui/DataTable/data-table-faceted-filter'
import { DownloadIcon, RefreshCw } from 'lucide-react'
import LocationFilterBar from '@/components/orders/FilterBar'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  page: string
  filters: any
  setKey?: any
  downloadRecords?: () => void
  isDownloading?: boolean
  dateRange?: any
  setDateRange?: any
  dateFilterType?: string
  setDateFilterType?: any
}

export function DataTableToolbar<TData>({
  table,
  page,
  filters,
  setKey,
  downloadRecords,
  isDownloading,
  dateRange,
  setDateRange,
  dateFilterType,
  setDateFilterType
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const search = filters?.search ?? {}

  if (!filters) {
    return null
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const searchBy = search?.by

    table.setPageIndex(0)
    if (Array.isArray(searchBy)) {
      table.setColumnFilters([]) // Reset column filters before applying new ones

      searchBy.forEach((col: string) => {
        table.getColumn(col)?.setFilterValue(value) // Apply filter value to all columns
      })
    } else if (typeof searchBy === 'string') {
      table.getColumn(searchBy)?.setFilterValue(value) // Apply filter to single column
    }
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-wrap items-center space-x-2 space-y-2'>
        {Object.keys(search).length > 0 && (
          <Input
            placeholder={search?.placeholder}
            value={
              ((Array.isArray(search?.by)
                ? search?.by
                    .map((col: string) =>
                      table.getColumn(col)?.getFilterValue()
                    )
                    .find(Boolean)
                : table.getColumn(search?.by)?.getFilterValue()) as string) ??
              ''
            }
            onChange={handleSearchChange}
            className='h-8 w-[150px] lg:w-[390px]'
          />
        )}

        {filters && page === 'products' && (
          <>
            {table.getColumn('isActive') && (
              <DataTableFacetedFilter
                column={table.getColumn('isActive')}
                title='Status'
                options={filters?.statusFilter}
              />
            )}
            {table.getColumn('collections') && (
              <DataTableFacetedFilter
                column={table.getColumn('collections')}
                title='Collections'
                options={filters?.collections ?? []}
              />
            )}
            {table.getColumn('saltType') && (
              <DataTableFacetedFilter
                column={table.getColumn('saltType')}
                title='Salt Type'
                options={filters?.saltTypeFilter ?? []}
              />
            )}
            {table.getColumn('consumption') && (
              <DataTableFacetedFilter
                column={table.getColumn('consumption')}
                title='Consumptions'
                options={filters?.consumptions ?? []}
              />
            )}
          </>
        )}

        {filters && page === 'coupons' && (
          <>
            {table.getColumn('active') && (
              <DataTableFacetedFilter
                column={table.getColumn('active')}
                title='Active/Inactive'
                options={filters?.activeFilter}
              />
            )}
            {table.getColumn('discountType') && (
              <DataTableFacetedFilter
                column={table.getColumn('discountType')}
                title='Discount Type'
                options={filters?.discountTypeFilter}
              />
            )}
            {table.getColumn('usageLimit') && (
              <DataTableFacetedFilter
                column={table.getColumn('usageLimit')}
                title='Usage Limit'
                options={filters?.usageLimitFilter}
              />
            )}
          </>
        )}

        {filters && page === 'stores' && (
          <>
            {table.getColumn('active') && (
              <DataTableFacetedFilter
                column={table.getColumn('active')}
                title='Status'
                options={filters?.storeToggleStatusFilter}
              />
            )}
            {table.getColumn('storeUser') && (
              <DataTableFacetedFilter
                column={table.getColumn('storeUser')}
                title='Store Account Status'
                options={filters?.storeStatusFilter}
              />
            )}
            {table.getColumn('state') && (
              <DataTableFacetedFilter
                column={table.getColumn('state')}
                title='State'
                options={filters?.stateFilter}
              />
            )}
          </>
        )}

        {filters && page === 'category' && (
          <>
            {table.getColumn('type') && (
              <DataTableFacetedFilter
                column={table.getColumn('type')}
                title='Category Type'
                options={filters?.typeFilter}
              />
            )}
          </>
        )}

        {filters && page === 'orders' && (
          <>
            {table.getColumn('status') && (
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title='Status'
                options={filters?.orderStatusFilters ?? []}
              />
            )}
            {table.getColumn('deliveryMode') && (
              <DataTableFacetedFilter
                column={table.getColumn('deliveryMode')}
                title='Delivery Mode'
                options={filters?.deliveryModeFilters ?? []}
              />
            )}
            {table.getColumn('payment') && (
              <DataTableFacetedFilter
                column={table.getColumn('payment')}
                title='Payment Method'
                options={filters?.orderPaymentMethodFilters ?? []}
              />
            )}

            {table.getColumn('lastTimelineStatus') && (
              <DataTableFacetedFilter
                column={table.getColumn('lastTimelineStatus')}
                title='Tracking Status'
                options={filters?.orderTrackingStatus ?? []}
              />
            )}

            {table.getColumn('hasDavaoneMembership') && (
              <DataTableFacetedFilter
                column={table.getColumn('hasDavaoneMembership')}
                title='DavaOne Membership'
                options={filters?.davaOneMembershipFilters ?? []}
              />
            )}
          </>
        )}

        {filters && page === 'users' && (
          <>
            {/* {table.getColumn('createdAt') && (
              <DataTableFacetedFilter
                column={table.getColumn('createdAt')}
                title='Date'
                options={filters?.userDateFilter}
              />
            )} */}

            {table.getColumn('isActive') && (
              <DataTableFacetedFilter
                column={table.getColumn('isActive')}
                title='Active'
                options={filters?.activeFilter}
              />
            )}
          </>
        )}

        {filters && page === 'sponsored' && (
          <>
            {table.getColumn('type') && (
              <DataTableFacetedFilter
                column={table.getColumn('type')}
                title='Type'
                options={filters?.typeFilter}
              />
            )}

            {table.getColumn('isActive') && (
              <DataTableFacetedFilter
                column={table.getColumn('isActive')}
                title='Active/Inactive'
                options={filters?.activeFilter}
              />
            )}
          </>
        )}

        {filters && page === 'inquiry' && (
          <>
            {table.getColumn('status') && (
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title='Status'
                options={filters?.statusFilter}
              />
            )}
            {table.getColumn('createdBy') && (
              <DataTableFacetedFilter
                column={table.getColumn('createdBy')}
                title='Issue'
                options={filters?.issueFilter}
              />
            )}
          </>
        )}

        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setPageIndex(0)
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      {page === 'orders' && (
        <div className='flex items-center gap-3'>
          <LocationFilterBar
            filters={{
              dateRange,
              dateFilterType: dateFilterType || 'all'
            }}
            setFilters={(updater: any) => {
              const next =
                typeof updater === 'function'
                  ? updater({
                      dateRange,
                      dateFilterType: dateFilterType || 'all'
                    })
                  : updater

              setDateRange(next.dateRange)
              setDateFilterType(next.dateFilterType)
            }}
          />
          <Button
            variant={'outline'}
            className={'mx-2 h-8 p-0 px-2'}
            onClick={() => {
              if (setKey) setKey(Date.now())
            }}
          >
            <RefreshCw size={18} className={'m-0'} />
          </Button>

          {downloadRecords && typeof downloadRecords == 'function' && (
            <Button
              variant={'outline'}
              className={`mx-2 h-8 p-0 px-2 ${isDownloading ? 'animate-bounce' : 'animate-none'}`}
              onClick={() => downloadRecords()}
              disabled={isDownloading ?? false}
            >
              <DownloadIcon size={18} className={'m-0'} />
              &nbsp; Download
            </Button>
          )}
        </div>
      )}
      {page === 'inquiry' && (
        <div className='flex items-center gap-3'>
          <LocationFilterBar
            filters={{
              dateRange,
              dateFilterType: dateFilterType || 'all'
            }}
            setFilters={(updater: any) => {
              const next =
                typeof updater === 'function'
                  ? updater({
                      dateRange,
                      dateFilterType: dateFilterType || 'all'
                    })
                  : updater

              setDateRange(next.dateRange)
              setDateFilterType(next.dateFilterType)
            }}
          />
          <Button
            variant={'outline'}
            className={'mx-2 h-8 p-0 px-2'}
            onClick={() => {
              if (setKey) setKey(Date.now())
            }}
          >
            <RefreshCw size={18} className={'m-0'} />
          </Button>
        </div>
      )}
      {page === 'medicine-requests' && (
        <div className='flex items-center gap-3'>
          {downloadRecords && typeof downloadRecords == 'function' && (
            <Button
              variant={'outline'}
              className={`mx-2 h-8 p-0 px-2 ${isDownloading ? 'animate-bounce' : 'animate-none'}`}
              onClick={() => downloadRecords()}
              disabled={isDownloading ?? false}
            >
              <DownloadIcon size={18} className={'m-0'} />
              &nbsp; Download
            </Button>
          )}
        </div>
      )}
      {page === 'products' && (
        <div className='flex items-center gap-3'>
          {downloadRecords && typeof downloadRecords == 'function' && (
            <Button
              variant={'outline'}
              className={`mx-2 h-8 p-0 px-2 ${isDownloading ? 'animate-bounce' : 'animate-none'}`}
              onClick={() => downloadRecords()}
              disabled={isDownloading ?? false}
            >
              <DownloadIcon size={18} className={'m-0'} />
              &nbsp; Download
            </Button>
          )}
        </div>
      )}
      {page === 'consumers' && (
        <div className='flex items-center gap-3'>
          {downloadRecords && typeof downloadRecords == 'function' && (
            <Button
              variant={'outline'}
              className={`mx-2 h-8 p-0 px-2 ${isDownloading ? 'animate-bounce' : 'animate-none'}`}
              onClick={() => downloadRecords()}
              disabled={isDownloading ?? false}
            >
              <DownloadIcon size={18} className={'m-0'} />
              &nbsp; Download
            </Button>
          )}
        </div>
      )}
      <DataTableViewOptions table={table} />
    </div>
  )
}
