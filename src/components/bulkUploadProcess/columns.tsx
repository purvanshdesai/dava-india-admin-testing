'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Store } from '@/components/ui/DataTable/data/schema'
import { DataTableColumnHeader } from '../ui/DataTable/data-table-column-header'
import moment from 'moment-timezone'
import { DownloadIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { downloadFileFromURL } from '@/lib/utils'

export const TaxesColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'processName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('processName') ?? '-'}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Uploaded By' />
    ),
    cell: ({ row }: any) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate text-xs font-medium'>
            {row?.original?.type === 'super-admin'
              ? row.original?.superAdminUser?.name
              : row.original?.storeAdminUser?.email}{' '}
            <span className='px-1 text-xs italic'>({row?.original?.type})</span>
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
    cell: ({ row }: any) => {
      return (
        <div className='flex w-[100px] flex-col gap-2'>
          {row.getValue('status')}

          {row.getValue('status') == 'in-progress' && (
            <div>
              <div className='mb-2 ms-[calc(25%-1.25rem)] inline-block rounded-lg border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:border-blue-800 dark:bg-blue-800/30 dark:text-blue-500'>
                {row.original?.percentage}%
              </div>
              <div
                className='flex h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700'
                role='progressbar'
                aria-valuenow={row.original?.percentage}
              >
                <div
                  className='flex flex-col justify-center overflow-hidden whitespace-nowrap rounded-full bg-blue-600 text-center text-xs text-white transition duration-500 dark:bg-blue-500'
                  style={{ width: `${row.original?.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'totalRecords',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Records' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('totalRecords')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'insertedCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inserted' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='w-[80px] truncate font-medium'>
            {row.getValue('insertedCount')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'failedCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Failed' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='w-[80px] truncate font-medium'>
            {row.getValue('failedCount')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'skippedRowsCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SKIPPED' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='w-[80px] truncate font-medium'>
            {row.getValue('skippedRowsCount')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'invalidRowsCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='INVALID ROWS' />
    ),
    cell: ({ row }: any) => {
      const errorFilePath = row.original?.errorFilePath
      const processName = row.original?.processName

      return (
        <div className='flex items-center gap-3'>
          <span className='truncate font-medium'>
            {row.getValue('invalidRowsCount')}
          </span>

          {errorFilePath && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DownloadIcon
                    onClick={() =>
                      downloadFileFromURL(
                        errorFilePath,
                        `${processName}-inventory-errors-${moment().format('DD-MMM')}.xlsx`
                      )
                    }
                    size={16}
                    className='cursor-pointer'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Errors</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date Time' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[150px] items-center'>
          {moment(row.getValue('updatedAt')).format('DD MMM YY, HH:mm A')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  }
]
