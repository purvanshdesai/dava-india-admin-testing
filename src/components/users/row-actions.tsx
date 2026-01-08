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

import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  setOpen: any
  onEditClick: any
}

export function DataTableRowActions<TData>({
  onEditClick,
  setOpen
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {hasPermission(
          MODULES_PERMISSIONS.USER_MANAGEMENT.key,
          MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.EDIT_USERS
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.USER_MANAGEMENT.key,
          MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.DELETE_USERS
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
          MODULES_PERMISSIONS.USER_MANAGEMENT.key,
          MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.EDIT_USERS
        ) ? (
          <DropdownMenuItem onClick={onEditClick}>Edit</DropdownMenuItem>
        ) : null}
        {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem> */}
        <DropdownMenuSeparator />
        {hasPermission(
          MODULES_PERMISSIONS.USER_MANAGEMENT.key,
          MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.DELETE_USERS
        ) ? (
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
