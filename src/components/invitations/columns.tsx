'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './row-actions'
import dayjs from 'dayjs'

import AlertBox from '@/components/AlertBox'
import { useState } from 'react'

import { toast } from '@/hooks/use-toast'
import { useDeleteInvitation } from '@/utils/hooks/userInvitationHooks'

export const userInvitationsColumns: ColumnDef<Store>[] = [
  {
    accessorKey: 'index',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sr No' />
    ),
    cell: ({ row, table }) => {
      return (
        <div className='line-clamp-2 w-10'>
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
      const [open, setOpen] = useState(false)

      const deleteSuperAdminUserMutation = useDeleteInvitation()

      const onContinue = async () => {
        await deleteSuperAdminUserMutation.mutateAsync({
          invitationId: row?.original?._id
        })

        toast({
          title: 'Success',
          description: 'Invitation deleted successfully!'
        })
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this invitation?'}
            onContinue={onContinue}
          />

          <DataTableRowActions row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
