'use client'
import { Button } from '../ui/button'
import { DataTable } from '../ui/DataTable/data-table'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { usersColumns } from './columns'
import Link from 'next/link'
import { useFetchRoles } from '@/utils/hooks/rolesHook'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useSearchParams } from 'next/navigation'

const Roles = () => {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const userDateFilter: any = [
    { value: true, label: 'Date' },
    { value: false, label: 'Date' }
  ]
  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { data, isLoading } = useFetchRoles({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: columnFilters
  })
  return (
    <>
      <div className='xxl:px-8 mt-4 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 font-semibold'>
              Roles
              {hasPermission(
                MODULES_PERMISSIONS.USER_MANAGEMENT.key,
                MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.READ_USERS
              ) && (
                <span className='text-sm text-label'>
                  ({data?.total ?? 0}){' '}
                </span>
              )}
            </h2>
          </div>
          <div className='flex items-center gap-4'>
            {hasPermission(
              MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
              MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.READ_ROLES
            ) ? (
              <Link href={'/users/roles/new'}>
                <Button size={'sm'} className='flex items-center gap-2'>
                  <Plus />
                  Add New Role
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
        <div className='pb-8'>
          {hasPermission(
            MODULES_PERMISSIONS.ROLE_MANAGEMENT.key,
            MODULES_PERMISSIONS.ROLE_MANAGEMENT.permissions.READ_ROLES
          ) ? (
            <DataTable
              data={data?.data ? data?.data : []}
              columns={usersColumns}
              page='roles'
              isLoading={isLoading}
              pagination={pagination}
              setPagination={setPagination}
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              totalRows={data?.total}
              filters={{
                userDateFilter,
                search: { by: 'roleName', placeholder: 'Search Roles ...' }
              }}
            />
          ) : (
            <div>You don't have access to read roles!</div>
          )}
        </div>
      </div>
    </>
  )
}

// Form

export default Roles
