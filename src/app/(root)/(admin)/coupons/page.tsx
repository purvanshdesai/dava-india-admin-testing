'use client'

import { Suspense } from 'react'
import CouponsList from '@/components/coupons/CouponsList'

export default function CouponsPage() {
  return (
    <Suspense>
      <CouponsList />
    </Suspense>
  )
}
