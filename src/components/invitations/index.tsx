'use client'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { useFetchSuperAdminUsersInvitations } from '@/utils/hooks/userInvitationHooks'
import React, { useState } from 'react'
import { userInvitationsColumns } from '@/components/invitations/columns'

const InvitationsTable = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  const { data: invitations, isLoading } = useFetchSuperAdminUsersInvitations({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize
  })

  return (
    <div>
      <div className='xxl:px-8 mt-4 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 font-semibold'>
              Invitations
              <span className='text-sm text-label'>
                ({invitations?.total ?? 0}){' '}
              </span>
            </h2>
          </div>
        </div>
        <div className='pb-8'>
          <DataTable
            data={invitations?.data ?? []}
            totalRows={invitations?.total}
            columns={userInvitationsColumns}
            page='usersInvitations'
            pagination={pagination}
            isLoading={isLoading}
            setPagination={setPagination}
            columnFilters={[]}
          />
        </div>
      </div>
    </div>
  )
}

export default InvitationsTable
