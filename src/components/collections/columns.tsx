'use client'

import { ColumnDef } from '@tanstack/react-table'

// import { Checkbox } from '@/components/ui/checkbox'
import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
// import moment from 'moment-timezone'
// import { Switch } from '../ui/switch'
// import { hasPermission } from '@/lib/permissions'
// import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
// import { useDeleteCoupon, usePatchCoupon } from '@/utils/hooks/couponHooks'
import { useState } from 'react'
import AlertBox from '@/components/AlertBox'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useDeleteCollection } from '@/utils/hooks/collectionsHooks'

export const collectionColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'slugUrl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Slug Url' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center lowercase'>
          {row.getValue('slugUrl')}
        </div>
      )
    }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return hasPermission(
        MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
        MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions.EDIT_COLLECTION
      ) ||
        hasPermission(
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions
            .DELETE_COLLECTION
        ) ? (
        <DataTableColumnHeader
          column={column}
          className='flex justify-end font-bold'
          title='ACTIONS'
        />
      ) : null
    },
    cell: ({ row, table }) => {
      const hasPermissions =
        hasPermission(
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions.EDIT_COLLECTION
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.key,
          MODULES_PERMISSIONS.COLLECTION_MANAGEMENT.permissions
            .DELETE_COLLECTION
        )

      if (!hasPermissions) return null
      const deleteCollectionMutation = useDeleteCollection()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteCollectionMutation.mutateAsync(row.original._id)
      }

      return (
        <div className='flex justify-end'>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this collection?'}
            onContinue={onContinue}
          />
          <DataTableRowActions table={table} row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
