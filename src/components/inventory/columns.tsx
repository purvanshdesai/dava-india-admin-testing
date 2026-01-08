'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import Image from 'next/image'

export const inventoryColumns: ColumnDef<Store>[] = [
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
  // {
  //   accessorKey: '_id',
  //   header: () => <></>,
  //   cell: () => <></>,
  //   enableSorting: true
  // },
  {
    accessorKey: 'product',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PRODUCT' />
    ),
    cell: ({ row }) => {
      const product: any = row.getValue('product')

      return (
        <div className='flex items-center space-x-4'>
          <div className='relative h-[60px] w-[60px]'>
            <Image
              src={product?.images[0]}
              alt={'Product'}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className='flex max-w-72 flex-col space-y-2'>
            <div className={'line-clamp-1 font-semibold'} title={product?.name}>
              {product?.name}
            </div>
            <div className='line-clamp-1' title={product?.description}>
              {product?.description}
            </div>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.name.includes(row.getValue(id))
    },
    enableHiding: false
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='CATEGORY' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[150px] truncate font-medium'>
            {row.getValue('category') ?? '--'}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='AVAILABLE STOCK' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('stock')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ACTIONS' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]
