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
import { rolesSchema } from '@/components/ui/DataTable/data/schema'

import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

interface DataTableRowActionsProps<TData> {
  table?: any
  row: Row<TData>
  setOpen: any
}

export function DataTableRowActions<TData>({
  table,
  row,
  setOpen
}: DataTableRowActionsProps<TData>) {
  const item = rolesSchema.parse(row.original)

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
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.EDIT_ROLES
        ) && (
          <DropdownMenuItem>
            <Link
              className='h-full w-full'
              href={`/users/roles/${item._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
            >
              Edit
            </Link>
          </DropdownMenuItem>
        )}
        {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem> */}
        <DropdownMenuSeparator />
        {hasPermission(
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.DELETE_ROLES
        ) && (
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
