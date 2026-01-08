'use client'

import React, { Suspense } from 'react'
import ConsumersList from '@/components/consumers/consumersList'

export default function ConsumersPage() {
  return (
    <Suspense>
      <ConsumersList />
    </Suspense>
  )
}
