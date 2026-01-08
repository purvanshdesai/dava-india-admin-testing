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
  // const task = categorySchema.parse(row.original)
  const rowData: any = row?.original

  return (
    <div className='w-[160px]'>
      {hasPermission(
        MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
        MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.READ_ORDER
      ) ? (
        <div className=''>
          <Link
            className='h-full w-full rounded-md border bg-primary px-4 py-1 text-white'
            href={`/orders/${rowData?._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
          >
            View
          </Link>
        </div>
      ) : null}
    </div>
  )
}
