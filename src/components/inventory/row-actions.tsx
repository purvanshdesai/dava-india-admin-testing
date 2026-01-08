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

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row
}: DataTableRowActionsProps<TData>) {
  const rowData: any = row.original

  // const task = categorySchema.parse(row.original)
  // const deleteCategoryMutation = useDeleteCategory()

  // const deleteStore = async (categoryId: string) => {
  //   try {
  //     await deleteCategoryMutation.mutateAsync({ categoryId })
  //   } catch (error) {
  //     throw error
  //   }
  // }

  return (
    <DropdownMenu>
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
          <Link
            className='h-full w-full'
            href={`/store/inventory/${rowData?._id}`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
