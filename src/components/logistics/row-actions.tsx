'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'

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

export function DataTableRowActions({ table, row, setOpen }: any) {
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
          MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.key,
          MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.permissions.EDIT_LOGISTICS
        ) ? (
          <DropdownMenuItem>
            <Link
              className='h-full w-full'
              href={`/logistics/${rowData?._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
            >
              Edit
            </Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission(
          MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.key,
          MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.permissions.DELETE_LOGISTICS
        ) ? (
          <DropdownMenuItem className={'cursor-pointer'} onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
