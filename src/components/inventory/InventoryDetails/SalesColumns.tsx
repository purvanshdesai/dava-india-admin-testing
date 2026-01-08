'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '@/components/ui/DataTable/data-table-column-header'

export const StoreSalesColumns: ColumnDef<Store>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label='Select all'
  //       className='translate-y-[2px]'
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={value => row.toggleSelected(!!value)}
  //       aria-label='Select row'
  //       className='translate-y-[2px]'
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false
  // },
  {
    accessorKey: 'index',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sr No' />
    ),
    cell: ({ row, table }) => {
      return (
        <div className='line-clamp-2 max-w-32'>
          {row.index +
            1 +
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize}
        </div>
      )
    },
    enableHiding: false,
    enableSorting: false
  },
  {
    accessorKey: 'orderId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ORDER ID' />
    ),
    cell: ({ row }: any) => (
      <div className='flex w-[100px] items-center'>
        {row.getValue('orderId')}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'orderDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='DATE' />
    ),
    cell: ({ row }: any) => (
      <div className='flex w-[150px] items-center'>
        {row.getValue('orderDate')}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'orderQuantity',
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title='ORDER QUANTITY' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('orderQuantity')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'orderMrp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='MRP' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('orderMrp')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'orderTotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='TOTAL' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('orderTotal')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'orderStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='STATUS' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('orderStatus')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  }
]
