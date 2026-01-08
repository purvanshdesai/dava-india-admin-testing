'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import moment from 'moment-timezone'
import { DataTableRowActions } from './row-action'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export const consumerColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),

    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),

    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('email')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Number' />
    ),

    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('phoneNumber')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Joined On' />
    ),

    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('createdAt')
              ? moment(row.getValue('createdAt')).format('DD MMM, YYYY')
              : '-'}
          </span>
        </div>
      )
    }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      const hasPermissions =
        hasPermission(
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.READ_CUSTOMER
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.EDIT_CUSTOMER
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.DELETE_CUSTOMER
        )

      return hasPermissions ? (
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
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.READ_CUSTOMER
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.EDIT_CUSTOMER
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.key,
          MODULES_PERMISSIONS.CUSTOMER_MANAGEMENT.permissions.DELETE_CUSTOMER
        )

      return hasPermissions ? (
        <DataTableRowActions table={table} row={row} />
      ) : null
    }
  }
]
