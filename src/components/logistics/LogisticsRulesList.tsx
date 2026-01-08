'use client'
import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import { useDebounce } from '@/utils/hooks/debounce'
import { useFetchLogisticsRules } from '@/utils/hooks/logisticsHooks'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { LogisticsColumn } from '@/components/logistics/columns'
import AddNewLogisticsRuleDialog from '@/components/logistics/AddNewRuleDialog'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export default function LogisticsRulesList() {
  {
    const searchParams = useSearchParams()

    const page = searchParams.get('page')
    const limit = searchParams.get('limit')

    const [pagination, setPagination] = useState<
      PaginationState & { _key?: number }
    >({
      pageIndex: page ? +page : 0,
      pageSize: limit ? +limit : 10,
      _key: 0
    })
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const debounceFilter = useDebounce(columnFilters, 1000)
    const { data } = useFetchLogisticsRules({
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      filters: debounceFilter
    })

    return (
      <div>
        <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
          <div className='flex items-center justify-between space-y-2'>
            <div>
              <h2 className='flex items-center gap-1 text-xl font-semibold'>
                Logistics Rules
                {hasPermission(
                  MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.key,
                  MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.permissions
                    .READ_LOGISTICS
                ) && (
                  <span className='text-sm text-label'>
                    ({data?.total ?? 0})
                  </span>
                )}
              </h2>
            </div>
            <div className='flex items-center gap-4'>
              {hasPermission(
                MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.key,
                MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.permissions
                  .CREATE_LOGISTICS
              ) && (
                <AddNewLogisticsRuleDialog
                  page={pagination.pageIndex}
                  limit={pagination.pageSize}
                />
              )}
            </div>
          </div>
          <div className='pb-8'>
            {hasPermission(
              MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.key,
              MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.permissions
                .READ_LOGISTICS
            ) ? (
              <DataTable
                data={data?.data ?? []}
                totalRows={data?.total ?? 0}
                pagination={pagination}
                page={'logisticsRules'}
                filters={{
                  search: { by: 'ruleName', placeholder: 'Search rule...' }
                }}
                setPagination={setPagination}
                columns={LogisticsColumn}
                setColumnFilters={setColumnFilters}
                columnFilters={columnFilters}
              />
            ) : (
              <div>You don't have access to read logistics!</div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
