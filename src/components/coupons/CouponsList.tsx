'use client'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { couponColumns } from '@/components/coupons/columns'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useFetchCoupons } from '@/utils/hooks/couponHooks'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useSearchParams } from 'next/navigation'

// export const metadata: Metadata = {
//   title: 'Coupons',
//   description: 'A task and issue tracker build using Tanstack Table.'
// }

export default function CouponsList() {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const activeFilter: any = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ]
  const discountTypeFilter: any = [
    { value: 'fixedAmount', label: 'Fixed Amount' },
    { value: 'percentage', label: 'Percentage' }
  ]
  const usageLimitFilter: any = [
    { value: 'oneTime', label: 'One Time' },
    { value: 'unlimited', label: 'Unlimited' }
  ]
  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })
  const useDebouncedValue = (inputValue: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(inputValue)

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(inputValue)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [inputValue, delay])

    return debouncedValue
  }

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const debouncedFilter = useDebouncedValue(columnFilters, 1000)

  const { data: coupons, isLoading } = useFetchCoupons({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debouncedFilter
  }) as any

  return (
    <>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 text-xl font-semibold'>
              Coupons
              {hasPermission(
                MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
                MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.READ_COUPON
              ) && (
                <span className='text-sm text-label'>
                  ({coupons?.total ?? 0}){' '}
                </span>
              )}
            </h2>
          </div>
          <div className='flex items-center gap-4'>
            {hasPermission(
              MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
              MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.CREATE_COUPON
            ) ? (
              <Link
                href={`/coupons/new?page=${page || pagination.pageIndex}&limit=${limit || pagination.pageSize}`}
              >
                <Button size={'sm'} className='flex items-center gap-2'>
                  <Plus />
                  Add New
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
        <div className='pb-8'>
          {hasPermission(
            MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
            MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.READ_COUPON
          ) ? (
            <DataTable
              data={coupons?.data ?? []}
              isLoading={isLoading}
              totalRows={coupons?.total ?? 0}
              columns={couponColumns}
              page='coupons'
              pagination={pagination}
              setPagination={setPagination}
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              filters={{
                activeFilter,
                discountTypeFilter,
                usageLimitFilter,
                search: {
                  by: 'couponName',
                  placeholder: 'Search by Coupon Name / Coupon Code ...'
                }
              }}
            />
          ) : (
            <div>You don't have access to view coupon details!</div>
          )}
        </div>
      </div>
    </>
  )
}
