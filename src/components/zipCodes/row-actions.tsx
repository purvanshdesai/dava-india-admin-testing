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

import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  setOpen: any
}

export function DataTableRowActions<TData>({
  setOpen
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {hasPermission(
          MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.key,
          MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.permissions.DELETE_ZIP_CODE
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
        <DropdownMenuItem onClick={() => setOpen(true)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
