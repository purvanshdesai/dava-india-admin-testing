'use client'

// import { Button } from '@/components/ui/button'
// import { Download } from 'lucide-react'

import { DataTable } from '@/components/ui/DataTable/data-table'
import { categories } from '@/components/ui/DataTable/data/data'
import { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useGetLanguages } from '@/utils/hooks/languageHooks'
import { languageColumns } from '@/components/languages/columns'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import AppBreadcrumb from '@/components/Breadcrumb'
import { useSearchParams } from 'next/navigation'

export default function LanguageList() {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data: language, isLoading } = useGetLanguages({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: columnFilters
  })

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Settings', href: '/settings' },
            { page: 'Languages' }
          ]}
        />
      </div>
      <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          {/*<div className='flex items-center gap-4'>*/}
          {/*  {hasPermission(*/}
          {/*    MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.key,*/}
          {/*    MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.permissions*/}
          {/*      .MANAGE_LABELS*/}
          {/*  ) ? (*/}
          {/*    <Button size={'sm'} className='flex items-center gap-2'>*/}
          {/*      <Download />*/}
          {/*      Download*/}
          {/*    </Button>*/}
          {/*  ) : null}*/}
          {/*</div>*/}
        </div>
        <div className='pb-8'>
          {hasPermission(
            MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.key,
            MODULES_PERMISSIONS.LANGUAGE_TRANSLATION_MANAGEMENT.permissions
              .READ_LABELS
          ) ? (
            <DataTable
              data={language?.data ? language?.data : []}
              totalRows={language?.total ? language?.total : 0}
              isLoading={isLoading}
              pagination={pagination}
              setPagination={setPagination}
              columns={languageColumns}
              page='languages'
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              filters={{
                categories,
                search: { by: 'text', placeholder: 'Search stores ...' }
              }}
            />
          ) : (
            <div>You don't have access to view language settings!</div>
          )}
        </div>
      </div>
    </div>
  )
}
