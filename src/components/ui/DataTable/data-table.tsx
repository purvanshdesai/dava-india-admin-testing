'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import TableSkeleton from '../TableSkeleton'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data?: TData[]
  dataState?: any
  page?: string
  filters?: object | null
  totalRows?: number
  pagination?: PaginationState | undefined
  setPagination?: React.Dispatch<
    React.SetStateAction<PaginationState & { _key?: number }>
  >
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  columnFilters?: ColumnFiltersState
  isLoading?: boolean
  actionsNotReq?: boolean
  downloadRecords?: () => void
  isDownloading?: boolean
  dateRange?: any
  setDateRange?: any
  dateFilterType?: string
  setDateFilterType?: any
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  dataState,
  page,
  filters,
  totalRows,
  pagination,
  setPagination,
  columnFilters,
  setColumnFilters,
  isLoading,
  actionsNotReq,
  downloadRecords,
  isDownloading,
  dateRange,
  setDateRange,
  dateFilterType,
  setDateFilterType
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Filter out the "Actions" column if actionsNotReq is true
  const filteredColumns = React.useMemo(
    () =>
      actionsNotReq
        ? columns.filter(column => column.id !== 'actions')
        : columns,
    [columns, actionsNotReq]
  )

  const filteredData = React.useMemo(() => {
    if (!columnFilters?.length) return data
    return data // Add filtering logic here if needed
  }, [data, columnFilters])

  const table = useReactTable({
    data: dataState?.[0] ?? filteredData,
    columns: filteredColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination
    },
    meta: { dataState },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    rowCount: totalRows,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: setPagination
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        page={page ?? ''}
        filters={filters}
        setKey={(key: number) => {
          if (setPagination) {
            setPagination((prev: any) => ({ ...prev, _key: key }))
          }
        }}
        downloadRecords={downloadRecords}
        isDownloading={isDownloading}
        dateRange={dateRange}
        setDateRange={setDateRange}
        dateFilterType={dateFilterType}
        setDateFilterType={setDateFilterType}
      />
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className='rounded-md border text-gray-700 dark:border-gray-500'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className='capitalize'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={filteredColumns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {pagination ? <DataTablePagination table={table} /> : null}
    </div>
  )
}
