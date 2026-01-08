'use client'

import { DataTable } from '@/components/ui/DataTable/data-table'
import { useEffect, useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'

import { zipCodeColumns } from '@/components/zipCodes/columns'
import { useFetchZipCodesPost } from '@/utils/hooks/zipCodeHooks'

export type TZipCodeTable = {
  zipCodes: number[]
  postalCodeType: string
  selectedRange: {
    to: number
    from: number
  }
}

export default function ZipCodeTable({
  zipCodes,
  postalCodeType = 'postalCode',
  selectedRange
}: TZipCodeTable) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: postalCodeType == 'postalCode' ? 10000 : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data: language, isLoading } = useFetchZipCodesPost({
    limit: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize,
    zipCodes: zipCodes?.map(zipCode => Number(zipCode)),
    type: postalCodeType == 'postalCode' ? 'zipCodes' : 'range',
    range: selectedRange
  })

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
            data={language?.data ? language?.data : []}
            totalRows={language?.total ? language?.total : 0}
            isLoading={isLoading}
            pagination={postalCodeType == 'postalCode' ? undefined : pagination}
            setPagination={setPagination}
            columns={zipCodeColumns}
            page='zipCode'
            setColumnFilters={setColumnFilters}
            columnFilters={columnFilters}
            filters={null}
            actionsNotReq={true}
          />
        </div>
      </div>
    </div>
  )
}
