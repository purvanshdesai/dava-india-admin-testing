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
  table: any
  setOpen: any
}

export function DataTableRowActions<TData>({
  row,
  setOpen
}: DataTableRowActionsProps<TData>) {
  // const task = categorySchema.parse(row.original)
  const rowData: any = row?.original

  const handleDelete = async () => {
    setOpen(true)
  }

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
          MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
          MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.CHANGE_ORDER_STORE
        ) ? (
          <DropdownMenuItem>
            <Link
              className='h-full w-full'
              href={`/settings/deliveryPolicy/${rowData?._id}`}
            >
              View
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className={'cursor-pointer'} onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
