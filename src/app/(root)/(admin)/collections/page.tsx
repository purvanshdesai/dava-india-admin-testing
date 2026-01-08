'use client'

import { Suspense } from 'react'
import Collections from '@/components/collections'

export default function CollectionPage() {
  return (
    <Suspense>
      <Collections />
    </Suspense>
  )
}
