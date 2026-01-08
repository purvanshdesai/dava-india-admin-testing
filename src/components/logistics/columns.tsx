import React, { useState } from 'react'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { ColumnDef } from '@tanstack/react-table'
import { Store } from '../ui/DataTable/data/schema'
import { DataTableRowActions } from './row-actions'
import AlertBox from '@/components/AlertBox'
import { useDeleteLogisticsRule } from '@/utils/hooks/logisticsHooks'
// import { hasPermission } from '@/lib/permissions'
// import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export const LogisticsColumn: ColumnDef<Store>[] = [
  {
    accessorKey: 'ruleName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Logistic Rule Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='font-medium'>{row.getValue('ruleName')}</span>
        </div>
      )
    }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return (
        <DataTableColumnHeader
          column={column}
          className='max-w-8 font-bold'
          title='ACTIONS'
        />
      )
    },
    cell: ({ row, table }) => {
      const deleteMutation = useDeleteLogisticsRule()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteMutation.mutateAsync(row.original._id)
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this logistics rule?'}
            onContinue={onContinue}
          />
          {/* {hasPermission(
            MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.key,
            MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.permissions.EDIT_LOGISTICS
          ) ||
            (hasPermission(
              MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.key,
              MODULES_PERMISSIONS.LOGISTICS_MANAGEMENT.permissions
                .DELETE_LOGISTICS
            ) && ( */}
          <DataTableRowActions table={table} row={row} setOpen={setOpen} />
          {/* ))} */}
        </div>
      )
    }
  }
]
