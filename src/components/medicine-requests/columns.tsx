'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-action'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export const requestMedicineColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'requestNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='REQUEST NO' />
    ),
    cell: ({ row }) => (
      <div className='line-clamp-2 max-w-24'>{row.getValue('requestNo')}</div>
    ),
    enableHiding: false
  },
  {
    accessorKey: 'requestedUserId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='REQUESTER NAME' />
    ),
    cell: ({ row }: any) => (
      <div className='flex items-center'>
        {row.getValue('requestedUserId')?.name}
      </div>
    )
  },
  {
    accessorKey: 'medicineName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='MEDICINE NAME' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>{row.getValue('medicineName')}</div>
    )
  },
  {
    accessorKey: 'requestedDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='REQUEST DATE' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('requestedDate')).toLocaleDateString()
      return <div className='flex items-center'>{date}</div>
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='STATUS' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center capitalize'>
        {row.getValue('status')}
      </div>
    )
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      const hasPermissions =
        hasPermission(
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.READ_MEDICINE_REQUEST
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.EDIT_MEDICINE_REQUEST
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.DELETE_MEDICINE_REQUEST
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
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.READ_MEDICINE_REQUEST
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.EDIT_MEDICINE_REQUEST
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.key,
          MODULES_PERMISSIONS.MEDICINE_REQUEST_MANAGEMENT.permissions.DELETE_MEDICINE_REQUEST
        )

      return hasPermissions ? (
        <DataTableRowActions row={row} table={table} />
      ) : null
    }
  }
]
