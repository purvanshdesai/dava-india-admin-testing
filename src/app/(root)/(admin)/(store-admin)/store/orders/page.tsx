'use client'

import { Suspense } from 'react'
import StoreOrders from '@/components/orders/StoreOrdersList'

export default function Orders() {
  return (
    <Suspense>
      <StoreOrders />
    </Suspense>
  )
}
