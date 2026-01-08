'use client'

import { Suspense } from 'react'
import StoresList from '@/components/stores/StoresList'

export default function StoresPage() {
  return (
    <Suspense>
      <StoresList />
    </Suspense>
  )
}
