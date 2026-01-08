'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableRowActions } from './row-actions'
import dayjs from 'dayjs'
import { DataTableColumnHeader } from '@/components/ui/DataTable/data-table-column-header'

export const OrderStoreAdminColumns: ColumnDef<Store>[] = [
  {
    accessorKey: 'index',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sr No' />
    ),
    cell: ({ row, table }) => {
      return (
        <div className='line-clamp-2 max-w-24'>
          {table.getState()?.pagination?.pageSize
            ? row.index +
              1 +
              table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize
            : row.index + 1}
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'orderId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ORDER ID' />
    ),
    cell: ({ row }) => (
      <div className='flex w-[100px] items-center font-medium'>
        {row.getValue('orderId')}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ORDER DATE' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            <div className='flex w-[170px] items-center lowercase'>
              {dayjs(row.getValue('createdAt')).format(
                process.env.DATE_TIME_FORMAT
              )}
            </div>
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PAYMENT STATUS' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center capitalize'>
          {row.getValue('status')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'lastTimelineStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='TIMELINE STATUS' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[200px] items-center'>
          {row.getValue('lastTimelineStatus')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'userId',
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title='CUSTOMER EMAIL' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('userId')?.email}
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
      <DataTableColumnHeader
        column={column}
        className='flex justify-center font-bold'
        title='ACTIONS'
      />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]
