'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { ticketsTableSchema } from '@/components/ui/DataTable/data/schema'

import Link from 'next/link'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

// interface DataTableRowActionsProps<TData> {
//   row: Row<TData>
// }

export function DataTableRowActions({
  table,
  row
}: {
  table?: any
  row: any // DataTableRowActionsProps<TData>
}) {
  const ticketRow = ticketsTableSchema.parse((row as any).original)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.EDIT_PRODUCT
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.DELETE_PRODUCT
        ) ||
        true ? (
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.EDIT_PRODUCT
        ) || true ? (
          <Link
            href={`/inquiries/${ticketRow._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
          >
            <DropdownMenuItem className={'cursor-pointer'}>
              Edit
            </DropdownMenuItem>
          </Link>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
