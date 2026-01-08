'use client'

import { ColumnDef } from '@tanstack/react-table'

// import { Checkbox } from '@/components/ui/checkbox'
import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '@/components/ui/DataTable/data-table-column-header'

export const StoreSalesColumns: ColumnDef<Store>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }: any) => (
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
  //   cell: ({ row }: any) => (
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
    accessorKey: 'order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ORDER ID' />
    ),
    cell: ({ row }: any) => (
      <div className='flex w-[100px] items-center'>
        {row.getValue('order')?._id}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'orderItem',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ORDER QUANTITY' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('orderItem')?.quantity}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'orderItem',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='MRP' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('orderItem')?.productDetails?.unitPrice}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'orderItem',
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title='TOTAL' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[100px] items-center'>
          {
            ((row.getValue('orderItem')?.productDetails?.unitPrice as number) *
              row.getValue('orderItem')?.quantity) as number
          }
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='STATUS' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[100px] items-center'>
          {row.getValue('order')?.status}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  }
]
