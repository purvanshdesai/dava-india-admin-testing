'use client'
import { ColumnDef } from '@tanstack/react-table'
import React, { useState } from 'react'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './couriers-row-actions'
import AlertBox from '@/components/AlertBox'
import { useDeleteLogisticsRuleCourier } from '@/utils/hooks/logisticsHooks'
import { useParams } from 'next/navigation'

export const LogisticsColumn: ColumnDef<any>[] = [
  {
    accessorKey: 'partner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Logistic Partner' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('partner')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'partnerCourierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Courier Partner' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('partnerCourierName')}
          </span>
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
          className='font-bold'
          title='ACTIONS'
        />
      )
    },
    cell: ({ row, table }) => {
      const params = useParams<{ logisticsId: string }>()
      const deleteMutation = useDeleteLogisticsRuleCourier()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteMutation.mutateAsync({
          ruleId: params.logisticsId,
          partner: row.original.partner,
          partnerCourierId: row.original.partnerCourierId
        })
      }

      return (
        <div>
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this courier?'}
            onContinue={onContinue}
          />
          <DataTableRowActions table={table} row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
