'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Products } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import AlertBox from '@/components/AlertBox'
import { useState } from 'react'
import { useDeleteProduct } from '@/utils/hooks/productHooks'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { cn } from '@/lib/utils'

export const productColumns: ColumnDef<Products>[] = [
  {
    accessorKey: 'index',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sr No' />
    ),
    cell: ({ row, table }) => {
      return (
        <div className='line-clamp-2 max-w-24'>
          {row.index +
            1 +
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize}
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='line-clamp-2 max-w-72'>{row.getValue('title')}</div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'sku',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SKU' />
    ),
    cell: ({ row }) => {
      return <div className='w-32'>{row.getValue('sku')}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'collections',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Collections' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2'>
          {(row.getValue('collections') as any)?.length
            ? (row.getValue('collections') as any)[0]?.name
            : '--'}
          <span
            className={cn(
              (row.getValue('collections') as any)?.length > 1
                ? 'rounded-full bg-gray-200 p-2 text-xs'
                : ''
            )}
          >
            {' '}
            {(row.getValue('collections') as any)?.length > 1
              ? ` +${(row.getValue('collections') as any)?.length - 1} `
              : ''}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'finalPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Final Price' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='w-[80px]'>{row.getValue('finalPrice')?.toFixed(2)}</div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'saltType',
    enableSorting: false,
    header: () => <></>,
    cell: () => {
      return <></>
    }
  },
  {
    accessorKey: 'isActive',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Active' />
    ),
    cell: ({ row }) => {
      return <div>{row.getValue('isActive') ? 'Active' : 'InActive'}</div>
    }
  },
  {
    accessorKey: 'consumption',
    enableSorting: false,
    header: () => <></>,
    cell: () => {
      return <></>
    }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return hasPermission(
        MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
        MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.EDIT_PRODUCT
      ) ||
        hasPermission(
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
          MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.DELETE_PRODUCT
        ) ? (
        <DataTableColumnHeader
          column={column}
          className='font-bold'
          title='ACTIONS'
        />
      ) : null
    },
    cell: ({ row, table }) => {
      const hasPermissions =
        hasPermission(
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
        )

      const deleteMutation = useDeleteProduct()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteMutation.mutateAsync(row.original._id)
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this product?'}
            onContinue={onContinue}
          />
          {hasPermissions ? (
            <DataTableRowActions table={table} row={row} setOpen={setOpen} />
          ) : null}
        </div>
      )
    }
  }
]
