'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  // DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import Link from 'next/link'
// import { useDeleteStore } from '@/utils/hooks/storeHooks'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  table: any
}

export function DataTableRowActions<TData>({
  row,
  table
}: DataTableRowActionsProps<TData>) {
  //   const task = storeSchema.parse(row.original)
  // const deleteStoreMutation = useDeleteStore()
  const rowData: any = row.original

  // const deleteStore = async (storeId: string) => {
  //   try {
  //     await deleteStoreMutation.mutateAsync({ storeId })
  //   } catch (error) {
  //     throw error
  //   }
  // }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {hasPermission(
          MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.key,
          MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.permissions
            .EDIT_LABELS
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
          MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.key,
          MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.permissions
            .EDIT_LABELS
        ) ? (
          <DropdownMenuItem>
            <Link
              className='h-full w-full'
              href={`/settings/language/${rowData._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`}
            >
              View
            </Link>
          </DropdownMenuItem>
        ) : null}
        {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem> */}
        {/* <DropdownMenuSeparator />
        {hasPermission(
          MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.key,
          MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.permissions
            .MANAGE_LABELS
        ) ? (
          <DropdownMenuItem onClick={() => deleteStore(rowData._id)}>
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : null} */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
