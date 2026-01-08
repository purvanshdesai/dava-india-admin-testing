import React, { Suspense } from 'react'
import Roles from '@/components/roles'

export default function page() {
  return (
    <Suspense>
      <div>
        <Roles />
      </div>
    </Suspense>
  )
}
