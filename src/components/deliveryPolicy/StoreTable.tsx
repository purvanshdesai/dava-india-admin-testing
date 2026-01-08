'use client'

import { storeColumns } from '@/components/stores/columns'
import { DataTable } from '@/components/ui/DataTable/data-table'

import { useFetchStoresPost } from '@/utils/hooks/storeHooks'
import { useEffect, useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'

export type TZipCodeTable = {
  zipCodes: number[]
  postalCodeType: string
  selectedRange: {
    to: number
    from: number
  }
  onChangeDeliverableStoresCount: (deliverableStoreCount: number) => void
}

export default function StoreTable({
  zipCodes,
  postalCodeType,
  selectedRange,
  onChangeDeliverableStoresCount
}: TZipCodeTable) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: postalCodeType == 'postalCode' ? 10000 : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data, isLoading } = useFetchStoresPost({
    limit: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize,
    zipCodes: zipCodes?.map(zipCode => Number(zipCode)),
    type: postalCodeType == 'postalCode' ? 'zipCodes' : 'range',
    range: selectedRange
  })

  useEffect(() => {
    console.log('total store c ', data)
    if (data && typeof data?.total == 'number') {
      onChangeDeliverableStoresCount(data?.total)
    }
  }, [data])

  useEffect(() => {
    if (postalCodeType) {
      setPagination({
        pageIndex: 0,
        pageSize: postalCodeType == 'postalCode' ? 10000 : 10
      })
    }
  }, [postalCodeType])

  return (
    <div>
      <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div>
          <DataTable
            data={data?.data ? data?.data : []}
            totalRows={data?.total ? data?.total : 0}
            isLoading={isLoading}
            pagination={postalCodeType == 'postalCode' ? undefined : pagination}
            setPagination={setPagination}
            columns={storeColumns}
            page='stores'
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            filters={null}
          />
        </div>
      </div>
    </div>
  )
}
