import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import StoreLogin from '@/components/auth/StoreLogin'

export const metadata: Metadata = {
  title: 'Dava India | Store Login',
  description: 'Dava India Store Admin Application'
}

export default function LoginPage() {
  return (
    <Suspense>
      <StoreLogin />
    </Suspense>
  )
}
