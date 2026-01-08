'use client'

import Users from '@/components/users'
import { Suspense } from 'react'

const UserDetailsPage = () => {
  return (
    <Suspense>
      <div>
        <Users />
      </div>
    </Suspense>
  )
}

export default UserDetailsPage
