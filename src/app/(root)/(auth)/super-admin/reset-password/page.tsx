'use client'

import React, { Suspense } from 'react'

import ResetSuperAdminPassword from '@/components/auth/ResetSuperAdminPassword'

export default function StoreResetPassword() {
  return (
    <Suspense>
      <ResetSuperAdminPassword />
    </Suspense>
  )
}
