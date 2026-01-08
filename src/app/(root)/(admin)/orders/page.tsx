'use client'

import { Suspense } from 'react'
import OrdersList from '@/components/orders/OrderList'

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  )
}
