import React, { Suspense } from 'react'
import Login from '@/components/auth/Login'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dava India | Login',
  description: 'Dava India Admin Application'
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  )
}
