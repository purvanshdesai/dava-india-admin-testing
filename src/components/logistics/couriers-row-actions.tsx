'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { hasPermission } from '@/lib/permissions'

export function DataTableRowActions({ setOpen }: any) {
  // const task = categorySchema.parse(row.original)
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
          <DropdownMenuItem className={'cursor-pointer'} onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
