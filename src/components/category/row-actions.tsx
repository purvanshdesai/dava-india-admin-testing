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

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  setOpen: any
}

export function DataTableRowActions<TData>({
  row,
  setOpen
}: DataTableRowActionsProps<TData>) {
  // const task = categorySchema.parse(row.original)
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
        <DropdownMenuItem>
          <Link className='h-full w-full' href={`/categories/${rowData?._id}`}>
            Edit
          </Link>
        </DropdownMenuItem>

        {/* <DropdownMenuItem>Make a copy</DropdownMenuItem> */}
        {/* <DropdownMenuItem>Favorite</DropdownMenuItem> */}
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setOpen(true)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
