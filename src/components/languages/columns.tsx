'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export const languageColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'text',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='KEYWORD' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('text')}
          </span>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'lookup_key',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='VALUE' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[400px] items-center truncate'>
          {row.getValue('lookup_key')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'groups',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='GROUP' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[250px] items-center'>
          {row.getValue('groups')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return hasPermission(
        MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.key,
        MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.permissions
          .EDIT_LABELS
      ) ? (
        <DataTableColumnHeader
          column={column}
          className='font-bold'
          title='ACTIONS'
        />
      ) : null
    },
    cell: ({ row, table }) =>
      hasPermission(
        MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.key,
        MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.permissions
          .EDIT_LABELS
      ) && <DataTableRowActions table={table} row={row} />
  }
]
