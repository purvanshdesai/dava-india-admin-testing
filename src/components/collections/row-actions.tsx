'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { collectionSchema } from '@/components/ui/DataTable/data/schema'
import Link from 'next/link'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
// import { hasPermission } from '@/lib/permissions'
// import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

interface DataTableRowActionsProps<TData> {
  table?: any
  row: Row<TData>
  setOpen?: any
}

export function DataTableRowActions<TData>({
  table,
  row,
  setOpen
}: DataTableRowActionsProps<TData>) {
  const task = collectionSchema.parse(row.original)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {/* {hasPermission(
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.DELETE_COUPON
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.EDIT_COUPON
        ) ? ( */}
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
        {/* ) : null} */}
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-[160px]'>
        {hasPermission(
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions.EDIT_COLLECTION
        ) ? (
          <DropdownMenuItem>
            <Link
              className='h-full w-full'
              href={`/collections/${task._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
            >
              Edit
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        {hasPermission(
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions
            .DELETE_COLLECTION
        ) ? (
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
