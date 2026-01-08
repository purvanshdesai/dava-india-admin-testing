'use client'

import { ColumnDef } from '@tanstack/react-table'

import { TicketsTable } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import dayjs from 'dayjs'

export const ticketsTableColumns: ColumnDef<TicketsTable>[] = [
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
    accessorKey: 'ticketId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ticket No' />
    ),
    cell: ({ row }) => {
      return <div className=''>{row.getValue('ticketId')}</div>
    },
    enableHiding: false
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ticket Date' />
    ),
    cell: ({ row }) => {
      return (
        <div className=''>
          {dayjs(row.getValue('createdAt')).format(
            process.env.DATE_TIME_FORMAT
          )}
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => {
      return (
        <div className=''>
          {' '}
          {dayjs(row.getValue('dueDate')).format(process.env.DATE_TIME_FORMAT)}
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order No' />
    ),
    cell: ({ row }) => {
      return <div className=''>{(row.getValue('order') as any)?.orderId}</div>
    },
    enableHiding: false
  },
  {
    accessorKey: 'order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order Date' />
    ),
    cell: ({ row }) => {
      const orderCreatedAt = (row.getValue('order') as any)?.createdAt
      return (
        <div className=''>
          {orderCreatedAt
            ? dayjs(orderCreatedAt).format(process.env.DATE_TIME_FORMAT)
            : '--'}
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Raised By' />
    ),
    cell: ({ row }) => {
      const createdBy: any = row.getValue('createdBy')
      return <div className=''>{createdBy?.name || createdBy?.fullName}</div>
    },
    enableHiding: false
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      return <div className=''>{row.getValue('status')}</div>
    },
    enableHiding: false
  },
  {
    accessorKey: 'pincode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='pincode' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className=''>
          {row?.original?.consultation?.address?.postalCode}
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'issue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reason' />
    ),
    cell: ({ row }) => {
      return <div className=''>{row.getValue('issue')}</div>
    },
    enableHiding: false
  },
  {
    accessorKey: 'assignee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assignee' />
    ),
    cell: ({ row }) => {
      return <div className=''>{row?.original?.assignee?.name || ''}</div>
    },
    enableHiding: false
  },
  {
    accessorKey: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ row, table }) => {
      return (
        <div>
          <DataTableRowActions table={table} row={row} />
        </div>
      )
    }
  }
]
