'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import dayjs from 'dayjs'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export const OrderColumns: ColumnDef<Store>[] = [
  {
    accessorKey: 'index',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.No' />
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
    accessorKey: '_id',
    header: ({}) => null,
    cell: ({}) => null,
    enableColumnFilter: false,
    enableHiding: false
  },
  {
    accessorKey: 'orderId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ORDER ID' />
    ),
    cell: ({ row }: any) => {
      const orderId = row.getValue('orderId')
      const userId = row.original?.userId
      const hasDavaoneMembership = userId?.hasDavaoneMembership
      const displayOrderId = hasDavaoneMembership ? `D-${orderId}` : orderId

      return <div className='flex w-[100px] items-center'>{displayOrderId}</div>
    },
    enableSorting: true,
    enableHiding: false
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
    accessorKey: 'store',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='store name' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[170px] items-center lowercase'>
          {row.getValue('store')?.storeName}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PAYMENT STATUS' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className='flex w-[150px] items-center'>
          {status?.replaceAll('-', ' ')}
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
        <div className='flex w-[100px] items-center'>
          {row.getValue('lastTimelineStatus')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'deliveryMode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='DELIVERY MODE' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('deliveryMode') == 'standard' ? 'Standard' : 'Same Day'}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='CUSTOMER NAME & Email' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex items-center'>
          <p className='truncate'>
            {row.getValue('userId')?.name || ''}
            {/* {' - '}
            {row.getValue('userId')?.email} */}
          </p>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    id: 'hasDavaoneMembership',
    accessorFn: (row: any) => {
      return row?.userId?.hasDavaoneMembership ? 'true' : 'false'
    },
    header: () => null,
    cell: () => null,
    enableHiding: true,
    enableSorting: false,
    filterFn: (row: any, id: any, value: any) => {
      const membershipStatus = row?.original?.userId?.hasDavaoneMembership
        ? 'true'
        : 'false'
      return value.includes(membershipStatus)
    }
  },

  // {
  //   accessorKey: 'payment',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='PAYMENT METHOD' />
  //   ),
  //   cell: ({ row }: any) => {
  //     const payment = row.getValue('payment') ?? {}

  //     return (
  //       <div className='flex w-[100px] items-center lowercase'>
  //         {payment?.paymentResponse?.mode ??
  //           payment?.paymentResponse?.method ??
  //           '-'}
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   }
  // },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return (
        hasPermission(
          MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
          MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.READ_ORDER
        ) && (
          <DataTableColumnHeader
            column={column}
            className='font-bold'
            title='ACTIONS'
          />
        )
      )
    },
    cell: ({ row, table }) =>
      hasPermission(
        MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
        MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.READ_ORDER
      ) && <DataTableRowActions table={table} row={row} />
  }
]
