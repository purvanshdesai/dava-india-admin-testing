'use client'
import React, { useState } from 'react'
import { TaxesColumns } from './Columns'
import { DataTable } from '../ui/DataTable/data-table'
import AddNewTax from './AddNewTax'
import AddTaxGroupName from './AddTaxGroupName'
import { useAllTaxes } from '@/utils/hooks/taxesHooks'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

const TaxesTable = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [columnFilters, setColumnFilters] = useState<any>([])

  const { data: taxes, isLoading }: any = useAllTaxes({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: columnFilters
  })

  //   const { data: orders, isLoading } = useGetOrders({
  //     $limit: pagination.pageSize,
  //     $skip: pagination.pageIndex * pagination.pageSize,
  //     filters: columnFilters
  //   })

  return (
    <div>
      <div className=''>
        <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
          <div className='flex items-center justify-end space-y-2'>
            {hasPermission(
              MODULES_PERMISSIONS.TAX_MANAGEMENT.key,
              MODULES_PERMISSIONS.TAX_MANAGEMENT.permissions.CREATE_TAX
            ) && (
              <div className='flex items-center gap-4'>
                <AddTaxGroupName />

                <AddNewTax />
              </div>
            )}
          </div>
          {hasPermission(
            MODULES_PERMISSIONS.TAX_MANAGEMENT.key,
            MODULES_PERMISSIONS.TAX_MANAGEMENT.permissions.READ_TAX
          ) ? (
            <div className='pb-8'>
              <DataTable
                data={taxes?.data}
                totalRows={taxes?.total}
                isLoading={isLoading}
                pagination={pagination}
                setPagination={setPagination}
                columns={TaxesColumns}
                page='Tax'
                setColumnFilters={setColumnFilters}
                columnFilters={columnFilters}
                filters={{
                  // categories,
                  search: { by: 'name', placeholder: 'Search Tax name ...' }
                }}
              />
            </div>
          ) : (
            <div>You don't have access to to read tax!</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaxesTable
