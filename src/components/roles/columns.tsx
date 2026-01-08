'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Roles } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import dayjs from 'dayjs'
import AlertBox from '../AlertBox'
import { useState } from 'react'
import { useDeleteRole, usePatchRole } from '@/utils/hooks/rolesHook'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { Switch } from '../ui/switch'

export const usersColumns: ColumnDef<Roles>[] = [
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
    accessorKey: 'roleName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ROLE' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span className='min-w-[100px] truncate font-medium'>
            {row.getValue('roleName')}
          </span>
          <span>
            {/* {row?.original?.fullAccess ? (
              <StarIcon color='green' size={16} />
            ) : (
              ''
            )} */}
          </span>
        </div>
      )
    },
    enableHiding: false
  },
  // {
  //   accessorKey: 'modules',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='MODULES' />
  //   ),
  //   cell: ({ row }) => {
  //     const modules: any = row.getValue('modules') || []

  //     return (
  //       <div className='grid grid-cols-2 gap-2'>
  //         {modules.map((module: any, index: number) => (
  //           <span
  //             key={index}
  //             className='rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700'
  //           >
  //             {module.moduleId?.moduleName || 'No Name'}
  //           </span>
  //         ))}
  //       </div>
  //     )
  //   },
  //   enableSorting: true
  // },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ADDED ON' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          {dayjs(row.getValue('createdAt')).format(
            process.env.DATE_TIME_FORMAT
          )}
        </div>
      )
    }
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // }
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='LAST UPDATED' />
    ),
    cell: ({ row }) => {
      return (
        <div className=''>
          {dayjs(row.getValue('updatedAt')).format(
            process.env.DATE_TIME_FORMAT
          )}
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
      const patchRoleMutation = usePatchRole()
      const handleToggle = async (newValue: boolean) => {
        setIsActive(newValue)
        try {
          await patchRoleMutation.mutateAsync({
            _id: row.original._id,
            active: newValue
          })
        } catch (error) {
          console.error('Failed to patch active status', error)
          setIsActive(row.getValue('active'))
        }
      }

      const permission = hasPermission(
        MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
        MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.EDIT_ROLES
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
  },

  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return hasPermission(
        MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
        MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.EDIT_ROLES
      ) ||
        hasPermission(
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.DELETE_ROLES
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
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.EDIT_ROLES
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
          MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.DELETE_ROLES
        )

      if (!hasPermissions) return null
      const deleteRoleMutation = useDeleteRole()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteRoleMutation.mutateAsync(row.original._id)
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this Role?'}
            onContinue={onContinue}
          />
          <DataTableRowActions table={table} row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
