'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import ChangeActive from './ChangeActive'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import {
  useChangeActiveStatus,
  useDeleteStore,
  useStoreResendInvite
} from '@/utils/hooks/storeHooks'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../ui/button'
import { useState } from 'react'
import AlertBox from '@/components/AlertBox'
import { useToast } from '@/hooks/use-toast'

export const storeColumns: ColumnDef<Store>[] = [
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
    accessorKey: '_id',
    header: ({}) => null,
    cell: ({}) => null,
    enableColumnFilter: false,
    enableHiding: false
  },
  {
    accessorKey: 'storeCode',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className='font-bold'
        title='STORE CODE'
      />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[200px] truncate font-medium'>
            {row.getValue('storeCode')}
          </span>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'storeName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className='font-bold'
        title='STORE NAME'
      />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('storeName')}
          </span>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'pincode',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className='font-bold'
        title='Zip Code'
      />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('pincode')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'state',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className='font-bold'
        title='STATE'
      />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('state')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className='font-bold'
        title='EMAIL'
      />
    ),
    cell: ({ row }) => {
      return (
        <div className='max-w-64 truncate lowercase'>
          {row.getValue('email')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className='font-bold'
        title='CITY'
      />
    ),
    cell: ({ row }) => {
      return <div className='flex items-center'>{row.getValue('city')}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  // {
  //   accessorKey: 'state',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='State' />
  //   ),
  //   cell: ({ row }) => {
  //     return <div className='flex items-center'>{row.getValue('state')}</div>
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   }
  // },
  {
    accessorKey: 'active',
    header({ column }) {
      return (
        <DataTableColumnHeader
          column={column}
          className='font-bold'
          title='STATUS'
        />
      )
    },
    cell({ row }) {
      const permission = hasPermission(
        MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
        MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.EDIT_STORE
      )
      const storeActiveMutation = useChangeActiveStatus()
      const queryClient = useQueryClient()

      const handleStatusChange = async (status: boolean) => {
        try {
          await storeActiveMutation.mutateAsync({
            storeId: row.getValue('_id'),
            active: status
          })
          queryClient.invalidateQueries({ queryKey: ['find-stores'] })
        } catch (error) {
          throw error
        }
      }
      return (
        <div className='flex items-center'>
          {/* <Switch checked={row.getValue('active')} /> */}

          <ChangeActive
            active={row.getValue('active')}
            disabled={permission ? false : true}
            onStatusChange={handleStatusChange}
          />
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'storeUser',
    header({ column }) {
      return (
        <DataTableColumnHeader
          column={column}
          className='font-bold'
          title='STORE ACCOUNT'
        />
      )
    },
    cell: ({ row }: any) => {
      // cl
      return (
        <div className='flex items-center'>
          {row.getValue('storeUser')?.password ? (
            <Button
              variant={'outline'}
              className='cursor-default border-none bg-inherit uppercase text-green-600 hover:bg-inherit hover:text-green-600'
            >
              Active
            </Button>
          ) : (
            <Button variant={'link'} className='uppercase text-primary'>
              Not Active
            </Button>
          )}
        </div>
      )
    }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return hasPermission(
        MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
        MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.EDIT_STORE
      ) ||
        hasPermission(
          MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
          MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.DELETE_STORE
        ) ? (
        <DataTableColumnHeader
          column={column}
          className='font-bold'
          title='ACTIONS'
        />
      ) : null
    },
    cell: ({ row, table }: any) => {
      const hasPermissions: any =
        hasPermission(
          MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
          MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.EDIT_STORE
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.STORE_MANAGEMENT.key,
          MODULES_PERMISSIONS.STORE_MANAGEMENT.permissions.DELETE_STORE
        )
      if (!hasPermissions) return null

      const deleteStoreMutation = useDeleteStore()
      const [open, setOpen] = useState(false)
      const resendInvitationMutation = useStoreResendInvite()
      const { toast } = useToast()

      const handleResendInvite = async () => {
        try {
          await resendInvitationMutation.mutateAsync({
            storeId: row?.getValue('_id')
          })
          toast({
            title: 'Success',
            description: 'Resent Invitation'
          })
        } catch (error) {
          throw error
        }
      }

      const onContinue = async () => {
        await deleteStoreMutation.mutateAsync({ storeId: row?.original._id })
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this store?'}
            onContinue={onContinue}
          />

          <DataTableRowActions
            table={table}
            row={row}
            setOpen={setOpen}
            isAccountActive={!row.getValue('storeUser')?.password}
            onResend={handleResendInvite}
          />
        </div>
      )
    }
  }
]
