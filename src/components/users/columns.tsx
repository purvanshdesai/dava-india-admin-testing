'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import { Switch } from '../ui/switch'
import dayjs from 'dayjs'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import {
  useDeleteAdminUser,
  usePatchAdminUser
} from '@/utils/hooks/superAdminHooks'
import AlertBox from '@/components/AlertBox'
import { useState } from 'react'
import EditUserForm from './EditUserRoles'
import FormDialog from '../form/FormDialogBox'

import { toast } from '@/hooks/use-toast'

export const usersColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium lowercase'>
            {row.getValue('email')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium capitalize'>
            {row.getValue('status') ? row.getValue('status') : ''}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'roleName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ROLE' />
    ),
    cell: ({ row }) => {
      return <div className='flex items-center'>{row.getValue('roleName')}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ADDED ON' />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt')
      const formattedDate =
        typeof createdAt === 'string' || createdAt instanceof Date
          ? dayjs(createdAt).format(process.env.DATE_TIME_FORMAT)
          : '-'
      return <div className='flex items-center'>{formattedDate}</div>
    }
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ACTIVE' />
    ),
    cell: ({ row }) => {
      // const isActive: boolean = row.getValue('isActive')
      // const setIsActive = (newValue: boolean) => (isActive = newValue)

      const patchAdminUserMutation = usePatchAdminUser()
      const { roleName, ...rowData } = row.original as any
      console.log(roleName)
      const handleToggle = async (newValue: boolean) => {
        // setIsActive(newValue)
        try {
          await patchAdminUserMutation.mutateAsync({
            superId: row.original._id,
            data: {
              ...rowData,
              role: rowData.role?._id,
              isActive: newValue
            }
          })
        } catch (error) {
          console.error('Failed to patch active status', error)
          // setIsActive(row.getValue('isActive'))
        }
      }
      const permission = hasPermission(
        MODULES_PERMISSIONS.USER_MANAGEMENT.key,
        MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.EDIT_USERS
      )
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('isActive')}
          <Switch
            disabled={permission && !row.getValue('status') ? false : true}
            checked={row.getValue('isActive')}
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
    enableHiding: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header({ column }) {
      return hasPermission(
        MODULES_PERMISSIONS.USER_MANAGEMENT.key,
        MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.EDIT_USERS
      ) ||
        hasPermission(
          MODULES_PERMISSIONS.USER_MANAGEMENT.key,
          MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.DELETE_USERS
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
          MODULES_PERMISSIONS.USER_MANAGEMENT.key,
          MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.EDIT_USERS
        ) ||
        hasPermission(
          MODULES_PERMISSIONS.USER_MANAGEMENT.key,
          MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.DELETE_USERS
        )

      if (!hasPermissions) return null
      const [isDialogOpen, setIsDialogOpen] = useState(false)
      const [open, setOpen] = useState(false)

      const handleEditClick = () => {
        setIsDialogOpen(true)
      }

      const deleteSuperAdminUserMutation = useDeleteAdminUser()

      const onContinue = async () => {
        await deleteSuperAdminUserMutation.mutateAsync({
          superId: row?.original?._id
        })

        toast({
          title: 'Success',
          description: 'User deleted successfully!'
        })
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this user?'}
            onContinue={onContinue}
          />

          <FormDialog
            footerNotReq={true}
            content={<EditUserForm table={table} data={row?.original} />}
            trigger={null}
            title={'Edit User Role'}
            footerActions={null}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />

          {!row.getValue('status') && (
            <DataTableRowActions
              row={row}
              setOpen={setOpen}
              onEditClick={handleEditClick}
            />
          )}
        </div>
      )
    }
  }
]
