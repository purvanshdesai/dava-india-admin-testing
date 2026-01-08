import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import SuperAdminForgotPassword from '@/components/auth/SuperAdminForgotPassword'

export const metadata: Metadata = {
  title: 'Dava India | Store Login',
  description: 'Dava India Store Admin Application'
}

export default function LoginPage() {
  return (
    <Suspense>
      <SuperAdminForgotPassword />
    </Suspense>
  )
}
