'use client'

import { Suspense } from 'react'
import DeliveryPolicyList from '@/components/deliveryPolicy/DeliveryPolicyList'

export default function DeliveryPolicyPage() {
  return (
    <Suspense>
      <DeliveryPolicyList />
    </Suspense>
  )
}
