'use client'

import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { categories } from '@/components/ui/DataTable/data/data'
import { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useGetDeliveryPolices } from '@/utils/hooks/deliveryPolicyHooks'
import { deliveryPolicyColumns } from '@/components/deliveryPolicy/columns'
import Link from 'next/link'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import AppBreadcrumb from '@/components/Breadcrumb'
import { useSearchParams } from 'next/navigation'
import DeliveryPolicyBulkUploadModal from './DeliveryPolicyBulkUploadModal'

export default function DeliveryPolicyList() {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)

  const { data: deliveryPolices, isLoading } = useGetDeliveryPolices({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: columnFilters
  })

  return (
    <div>
      <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <div className='pb-4'>
              <AppBreadcrumb
                // prev={{
                //   page: 'Settings',
                //   href: '/settings'
                // }}
                // current={{
                //   page: 'Delivery Policy'
                // }}
                locations={[
                  {
                    page: 'Settings',
                    href: '/settings'
                  },
                  {
                    page: 'Delivery Policy'
                  }
                ]}
              />
            </div>
          </div>

          {hasPermission(
            MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
            MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions
              .CREATE_DELIVERY_POLICY
          ) ? (
            <div className='flex items-center gap-4'>
              <Button
                size={'sm'}
                className='flex items-center gap-2'
                variant='outline'
                onClick={() => setIsBulkUploadOpen(true)}
              >
                <Upload className='h-4 w-4' />
                Bulk Upload
              </Button>
              <Link
                href={`/settings/deliveryPolicy/new?page=${pagination.pageIndex}&limit=${pagination.pageSize}`}
              >
                <Button size={'sm'} className='flex items-center gap-2'>
                  <Plus />
                  Add New
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
        <div className='pb-8'>
          {hasPermission(
            MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
            MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions
              .READ_DELIVERY_POLICY
          ) ? (
            <DataTable
              data={deliveryPolices?.data ? deliveryPolices?.data : []}
              totalRows={deliveryPolices?.total ? deliveryPolices?.total : 0}
              isLoading={isLoading}
              pagination={pagination}
              setPagination={setPagination}
              columns={deliveryPolicyColumns}
              page='zipCode'
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              filters={{
                categories,
                search: {
                  by: 'zoneName',
                  placeholder: 'Search by zone name, postal codes'
                }
              }}
            />
          ) : (
            <div>You don't have access to read delivery policies!</div>
          )}
        </div>
      </div>
      <DeliveryPolicyBulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}
