'use client'

import React, { Suspense } from 'react'

import ResetStoreUserPassword from '@/components/auth/ResetStoreUserPassword'

export default function StoreResetPassword() {
  return (
    <Suspense>
      <ResetStoreUserPassword />
    </Suspense>
  )
}
