import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table
}: DataTablePaginationProps<TData>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  return (
    <div className='flex items-center justify-end px-2'>
      {/* <div className='text-muted-foreground flex-1 text-sm'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div> */}
      <div className='flex items-center space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => {
              table.setPageSize(Number(value))

              if (page && limit) {
                const params = new URLSearchParams(window.location.search)
                params.set(
                  'page',
                  table.getState().pagination.pageIndex.toString()
                )
                params.set('limit', value)
                router.push(`?${params.toString()}`, { scroll: false })
              }
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[5, 10, 20, 30, 40, 50, 100].map(pageSize => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex min-w-[100px] max-w-[150px] items-center justify-center text-sm font-medium'>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => {
              table.setPageIndex(0)

              if (page && limit) {
                const params = new URLSearchParams(window.location.search)
                params.set('page', '0')
                params.set(
                  'limit',
                  table.getState().pagination.pageSize.toString()
                )
                router.push(`?${params.toString()}`, { scroll: false })
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Go to first page</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => {
              table.previousPage()

              if (page && limit) {
                const params = new URLSearchParams(window.location.search)
                params.set(
                  'page',
                  `${table.getState().pagination.pageIndex - 1}`
                )
                params.set(
                  'limit',
                  table.getState().pagination.pageSize.toString()
                )
                router.push(`?${params.toString()}`, { scroll: false })
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => {
              table.nextPage()

              if (page && limit) {
                const params = new URLSearchParams(window.location.search)
                params.set(
                  'page',
                  `${table.getState().pagination.pageIndex + 1}`
                )
                params.set(
                  'limit',
                  table.getState().pagination.pageSize.toString()
                )
                router.push(`?${params.toString()}`, { scroll: false })
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1)

              if (page && limit) {
                const params = new URLSearchParams(window.location.search)
                params.set('page', table.getPageCount().toString())
                params.set(
                  'limit',
                  table.getState().pagination.pageSize.toString()
                )
                router.push(`?${params.toString()}`, { scroll: false })
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Go to last page</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
