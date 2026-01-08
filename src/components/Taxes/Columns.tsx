'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { TableRowActions } from './TableRowActions'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export const TaxesColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tax Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>{row.getValue('name')}</div>
    ),
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tax Type' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('type')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'rate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tax Rate' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('rate')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'rateType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tax Rate Type' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('rateType')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'actions',
    header({ column }) {
      return
      hasPermission(
        MODULES_PERMISSIONS.TAX_MANAGEMENT.key,
        MODULES_PERMISSIONS.TAX_MANAGEMENT.permissions.DELETE_TAX
      ) ? (
        <DataTableColumnHeader
          column={column}
          className='font-bold'
          title='ACTIONS'
        />
      ) : null
    },
    cell: ({ row }) => {
      const hasPermissions = hasPermission(
        MODULES_PERMISSIONS.TAX_MANAGEMENT.key,
        MODULES_PERMISSIONS.TAX_MANAGEMENT.permissions.DELETE_TAX
      )

      if (!hasPermissions) return null
      return <TableRowActions row={row} />
    }
  }
]
