'use client'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import { useState } from 'react'
import AlertBox from '@/components/AlertBox'
import { useDeleteZipCode } from '@/utils/hooks/zipCodeHooks'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export const zipCodeColumns: ColumnDef<any>[] = [
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
    accessorKey: 'zipCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Zip Code' />
    ),
    cell: ({ row }) => {
      return <span className='font-medium'>{row.getValue('zipCode')}</span>
    },
    enableHiding: false
  },
  {
    accessorKey: 'area',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Area' />
    ),
    cell: ({ row }) => {
      return <div className='text-sm'>{row.getValue('area')}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'district',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='District' />
    ),
    cell: ({ row }) => {
      return <div className='text-sm'>{row.getValue('district')}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'state',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='State' />
    ),
    cell: ({ row }) => {
      return <div className='text-sm'>{row.getValue('state')}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      // return hasPermission(
      //   MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.key,
      //   MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.permissions.EDIT_ZIP_CODE
      // ) &&
      return hasPermission(
        MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.key,
        MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.permissions.DELETE_ZIP_CODE
      ) ? (
        <DataTableColumnHeader
          column={column}
          className='font-bold'
          title='ACTIONS'
        />
      ) : null
    },
    cell: ({ row }) => {
      const hasPermissions =
        // hasPermission(
        //   MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.key,
        //   MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.permissions.EDIT_ZIP_CODE
        // ) &&
        hasPermission(
          MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.key,
          MODULES_PERMISSIONS.ZIP_CODE_MANAGEMENT.permissions.DELETE_ZIP_CODE
        )

      if (!hasPermissions) return null
      const [open, setOpen] = useState(false)
      const deleteZipCodeMutation = useDeleteZipCode()

      const onContinue = async () => {
        await deleteZipCodeMutation.mutateAsync({ zipCodeId: row.original._id })
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this zip code?'}
            onContinue={onContinue}
          />
          <DataTableRowActions row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
