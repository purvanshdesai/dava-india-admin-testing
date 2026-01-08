'use client'
import { ColumnDef } from '@tanstack/react-table'
import React, { useState } from 'react'
import { Store } from '../ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import { DataTableRowActions } from './zone-row-actions'
import AlertBox from '@/components/AlertBox'
import { useDeleteLogisticsRuleDeliveryZone } from '@/utils/hooks/logisticsHooks'
import { useParams } from 'next/navigation'

export const ZoneColumn: ColumnDef<Store>[] = [
  {
    accessorKey: 'zoneName',
    header: ({ column }) => (
      <DataTableColumnHeader
        className='uppercase'
        column={column}
        title='Delivery zone name'
      />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('zoneName')}
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
      const deleteMutation = useDeleteLogisticsRuleDeliveryZone()
      const [open, setOpen] = useState(false)

      const onContinue = async () => {
        await deleteMutation.mutateAsync({
          ruleId: params.logisticsId,
          deliveryPolicyId: row.original._id
        })
      }

      return (
        <div>
          {' '}
          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete this delivery zone?'}
            onContinue={onContinue}
          />
          <DataTableRowActions table={table} row={row} setOpen={setOpen} />
        </div>
      )
    }
  }
]
