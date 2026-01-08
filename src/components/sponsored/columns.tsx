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
import { useDeleteSponsor, usePatchSponsor } from '@/utils/hooks/sponsoredHooks'
import AlertBox from '@/components/AlertBox'
import { useState } from 'react'

export const sponsorColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'sectionName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Section Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('sectionName')}
          </span>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('type')}
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
    accessorKey: 'endDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='End Date' />
    ),
    cell: ({ row }) => {
      const endDate = moment(row.getValue('endDate'))
      return (
        <div className='flex w-[100px] items-center'>
          {endDate.isValid()
            ? endDate.format(process.env.DATE_FORMAT)
            : 'Never End'}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },

  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Active' />
    ),
    cell: ({ row }) => {
      let isActive: boolean = row.getValue('isActive')
      const setIsActive = (newValue: boolean) => (isActive = newValue)

      const patchSponsorMutation = usePatchSponsor()
      const handleToggle = async (newValue: boolean) => {
        setIsActive(newValue)
        try {
          await patchSponsorMutation.mutateAsync({
            ...row.original,
            isActive: newValue
          })
        } catch (error) {
          console.error('Failed to patch active status', error)
          setIsActive(row.getValue('isActive'))
        }
      }
      const permission = hasPermission(
        MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
        MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.EDIT_SPONSOR
      )
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('isActive')}
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
      return (
        <DataTableColumnHeader
          column={column}
          className='font-bold'
          title='ACTIONS'
        />
      )
    },
    cell: ({ row }) => {
      const deleteSponsorMutation = useDeleteSponsor()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteSponsorMutation.mutateAsync(row.original._id)
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this sponsor settings?'}
            onContinue={onContinue}
          />
          <DataTableRowActions row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
