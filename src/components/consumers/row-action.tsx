'use client'
import { Row } from '@tanstack/react-table'
import Link from 'next/link'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { hasPermission } from '@/lib/permissions'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  table: any
}

export function DataTableRowActions<TData>({
  table,
  row
}: DataTableRowActionsProps<TData>) {
  const rowData: any = row?.original

  const hasReadPermission = hasPermission(
    MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
    MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.READ_CUSTOMER
  )
  const hasEditPermission = hasPermission(
    MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
    MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.EDIT_CUSTOMER
  )

  if (!hasReadPermission && !hasEditPermission) {
    return null
  }

  return (
    <div className='w-[160px]'>
      {hasReadPermission && (
        <div className=''>
          <Link
            className='h-full w-full rounded-md border bg-primary px-4 py-1 text-white'
            href={`/customers/${rowData?._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
          >
            View
          </Link>
        </div>
      )}
    </div>
  )
}
