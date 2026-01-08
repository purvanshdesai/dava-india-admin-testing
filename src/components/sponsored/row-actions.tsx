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
import { sponsorSchema } from '../ui/DataTable/data/schema'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  setOpen?: any
}

export function DataTableRowActions<TData>({
  row,
  setOpen
}: DataTableRowActionsProps<TData>) {
  const item: any = sponsorSchema.parse(row.original)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {hasPermission(
          MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
          MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.EDIT_SPONSOR
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
          MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.DELETE_SPONSOR
        ) ? (
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
          MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
          MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.EDIT_SPONSOR
        ) ? (
          <DropdownMenuItem>
            <Link className='h-full w-full' href={`/sponsored/${item._id}`}>
              Edit
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />
        {hasPermission(
          MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
          MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.DELETE_SPONSOR
        ) ? (
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
