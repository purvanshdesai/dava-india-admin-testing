'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../../ui/DataTable/data-table-column-header'

export const StockAdjustmentColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='DATE' />
    ),
    cell: ({ row }) => {
      return <div className='flex space-x-2'>{row.getValue('date')}</div>
    }
  },
  {
    accessorKey: 'prevStockQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PREVIOUS STOCK QTY' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {Math.floor(Number(row.getValue('prevStockQty')))}
        </div>
      )
    }
  },
  {
    accessorKey: 'adjustedStockQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ADJUSTED QTY' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {Math.floor(Number(row.getValue('adjustedStockQty')))}
        </div>
      )
    }
  },
  {
    accessorKey: 'uploadedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='UPLOADED BY' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('uploadedBy')}
        </div>
      )
    }
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='REASON FOR ADJUSTMENT' />
    ),
    cell: ({ row }) => {
      return <div className='flex'>{row.getValue('reason')}</div>
    }
  }
]
