'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { productsSchema } from '@/components/ui/DataTable/data/schema'

import Link from 'next/link'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

// interface DataTableRowActionsProps<TData> {
//   row: Row<TData>
// }

export function DataTableRowActions({
  table,
  row,
  setOpen
}: {
  table?: any
  row: any // DataTableRowActionsProps<TData>
  setOpen: any
}) {
  const product = productsSchema.parse((row as any).original)

  const handleDelete = async () => {
    setOpen(true)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.EDIT_PRODUCT
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.DELETE_PRODUCT
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.READ_PRODUCT
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
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.EDIT_PRODUCT
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.READ_PRODUCT
        ) ? (
          <Link
            href={
              product.variationId
                ? `/products/variations/${product.variationId}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`
                : `/products/${product._id}?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`
            }
          >
            <DropdownMenuItem className={'cursor-pointer'}>
              Edit
            </DropdownMenuItem>
          </Link>
        ) : null}
        {hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.EDIT_PRODUCT
        ) &&
          hasPermission(
            MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
            MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.DELETE_PRODUCT
          ) && <DropdownMenuSeparator />}
        {hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.DELETE_PRODUCT
        ) ? (
          <DropdownMenuItem className={'cursor-pointer'} onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
