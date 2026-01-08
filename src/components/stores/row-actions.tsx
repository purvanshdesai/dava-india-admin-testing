'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import Link from 'next/link'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { hasPermission } from '@/lib/permissions'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  setOpen: any
  isAccountActive: boolean
  onResend: () => void
  table: any
}

export function DataTableRowActions<TData>({
  row,
  setOpen,
  onResend,
  isAccountActive,
  table
}: DataTableRowActionsProps<TData>) {
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
          MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
          MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.EDIT_STORE
        ) && (
          <div>
            {' '}
            <DropdownMenuItem>
              <Link
                className='h-full w-full'
                href={`/stores/${rowData?._id}?page=${table.getState()?.pagination?.pageIndex || 0}&limit=${table.getState()?.pagination?.pageSize || 0}`}
              >
                Edit
              </Link>
            </DropdownMenuItem>
            {isAccountActive ? (
              <DropdownMenuItem onClick={onResend}>
                Resend Link
              </DropdownMenuItem>
            ) : null}
          </div>
        )}
        {hasPermission(
          MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
          MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.DELETE_STORE
        ) && (
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
