'use client'

import { Suspense } from 'react'
import OrderDetails from '@/components/orders/OrderDetails'

export default function page(params: any) {
  return (
    <Suspense>
      <OrderDetails {...params} />
    </Suspense>
  )
}
