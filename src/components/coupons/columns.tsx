'use client'

import { ColumnDef } from '@tanstack/react-table'

// import { Checkbox } from '@/components/ui/checkbox'
import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import moment from 'moment-timezone'
import { Switch } from '../ui/switch'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useDeleteCoupon, usePatchCoupon } from '@/utils/hooks/couponHooks'
import { useState } from 'react'
import AlertBox from '@/components/AlertBox'

export const couponColumns: ColumnDef<Store>[] = [
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
  // {
  //   accessorKey: '_id',
  //   header: ({ column }) => null,
  //   cell: ({ row }) => null,
  //   enableSorting: true
  // },
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
    accessorKey: 'couponName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Coupon Name' />
    ),

    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('couponName')}
          </span>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'couponCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Coupon Code' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('couponCode')}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    accessorKey: 'discountType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Discount Type' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('discountType')}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    accessorKey: 'discountValue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Discount Value' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('discountValue')}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    accessorKey: 'usageLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Usage Limit ' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('usageLimit')}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Start Date' />
    ),
    cell: ({ row }) => {
      const startDate = moment(row.getValue('startDate'))
      return (
        <div className='flex w-[100px] items-center'>
          {startDate.isValid()
            ? startDate.format(process.env.DATE_FORMAT)
            : 'Never End'}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    accessorKey: 'expiryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expiry Date' />
    ),
    cell: ({ row }) => {
      const expiryDate = moment(row.getValue('expiryDate'))
      return (
        <div className='flex w-[100px] items-center'>
          {expiryDate.isValid()
            ? expiryDate.format(process.env.DATE_FORMAT)
            : 'Never End'}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    accessorKey: 'isOfflineCoupon',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Is Offline Coupon' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('isOfflineCoupon') ? 'Yes' : 'No'}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    accessorKey: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Active' />
    ),
    cell: ({ row }) => {
      // const [isActive, setIsActive] = useState<boolean>(row.getValue('active'))
      let isActive: boolean = row.getValue('active')
      const setIsActive = (newValue: boolean) => (isActive = newValue)
      const patchCouponMutation = usePatchCoupon()
      const handleToggle = async (newValue: boolean) => {
        setIsActive(newValue)
        try {
          await patchCouponMutation.mutateAsync({
            _id: row.original._id,
            active: newValue
          })
        } catch (error) {
          console.error('Failed to patch active status', error)
          setIsActive(row.getValue('active'))
        }
      }

      const permission = hasPermission(
        MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
        MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.EDIT_COUPON
      )
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('active')}
          {
            <Switch
              disabled={permission ? false : true}
              checked={isActive}
              onCheckedChange={field => handleToggle(field)}
              className='group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 data-[checked]:bg-primary data-[checked]:text-primary'
            >
              <span
                aria-hidden='true'
                className='pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5'
              />
            </Switch>
          }
        </div>
      )
    },
    enableHiding: false
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return hasPermission(
        MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
        MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.EDIT_COUPON
      ) ||
        hasPermission(
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.DELETE_COUPON
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
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.EDIT_COUPON
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.key,
          MODULES_PERMISSIONS.COUPON_MANAGEMENT.permissions.DELETE_COUPON
        )

      if (!hasPermissions) return null

      const deleteCouponMutation = useDeleteCoupon()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteCouponMutation.mutateAsync(row.original._id)
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this coupon?'}
            onContinue={onContinue}
          />
          <DataTableRowActions table={table} row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
