import React, { Suspense } from 'react'

import InvitationsTable from '@/components/invitations'

export default function page() {
  return (
    <Suspense>
      <div>
        <InvitationsTable />
      </div>
    </Suspense>
  )
}
