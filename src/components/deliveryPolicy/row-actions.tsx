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

import Link from 'next/link'

import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  setOpen: any
  table: any
}

export function DataTableRowActions<TData>({
  row,
  setOpen,
  table
}: DataTableRowActionsProps<TData>) {
  //   const task = storeSchema.parse(row.original)
  const rowData: any = row?.original

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {hasPermission(
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions
            .EDIT_DELIVERY_POLICY
        ) && (
          <DropdownMenuItem>
            <Link
              className='h-full w-full'
              href={`/settings/deliveryPolicy/${rowData?._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
            >
              Edit
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {hasPermission(
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions
            .DELETE_DELIVERY_POLICY
        ) && (
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
