'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import {
  useDeleteDeliveryPolicy,
  usePatchDeliveryPolicy
} from '@/utils/hooks/deliveryPolicyHooks'
import { useQueryClient } from '@tanstack/react-query'
import ChangeActive from '../stores/ChangeActive'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip'
import AlertBox from '@/components/AlertBox'
import { useState } from 'react'

export const deliveryPolicyColumns: ColumnDef<Store>[] = [
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
    accessorKey: '_id',
    header: ({}) => null,
    cell: ({}) => null,
    enableColumnFilter: false,
    enableHiding: false
  },
  {
    accessorKey: 'zoneName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Zone Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('zoneName')}
          </span>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'postalCodeType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Postal Code Type' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('postalCodeType')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'postalCodes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Postal Codes' />
    ),
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className='max-w-[150px]'>
                <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
                  {(row.getValue('postalCodes') as [])?.join(', ')}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>{(row.getValue('postalCodes') as [])?.join(', ')}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  // {
  //   accessorKey: 'expectedDeliveryTime',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Expected Delivery Days' />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className='flex w-[100px] items-center'>
  //         {row.getValue('expectedDeliveryTime')}
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   }
  // },
  {
    accessorKey: 'active',
    header({ column }) {
      return <DataTableColumnHeader column={column} title='Active' />
    },
    cell({ row }) {
      const permission = hasPermission(
        MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
        MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions.EDIT_DELIVERY_POLICY
      )
      const deliveryPolicyPatchMutation = usePatchDeliveryPolicy()
      const queryClient = useQueryClient()

      const handleStatusChange = async (status: boolean) => {
        try {
          await deliveryPolicyPatchMutation.mutateAsync({
            deliveryPolicyId: row.getValue('_id'),
            data: {
              active: status
            }
          })
          queryClient.invalidateQueries({ queryKey: ['find-deliveryPolicy'] })
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
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return hasPermission(
        MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
        MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions.EDIT_DELIVERY_POLICY
      ) ||
        hasPermission(
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions
            .DELETE_DELIVERY_POLICY
        ) ? (
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
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions
            .EDIT_DELIVERY_POLICY
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.key,
          MODULES_PERMISSIONS.DELIVERY_MANAGEMENT.permissions
            .DELETE_DELIVERY_POLICY
        )
      if (!hasPermissions) return null

      const deleteDeliveryPolicyMutation = useDeleteDeliveryPolicy()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteDeliveryPolicyMutation.mutateAsync({
          deliveryPolicyId: row.original._id
        })
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this delivery policy?'}
            onContinue={onContinue}
          />
          <DataTableRowActions table={table} row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
