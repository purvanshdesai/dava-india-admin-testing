import React, { ReactElement } from 'react'
import CouponsForm from '@/components/coupons/CouponDetails'

type Props = {
  params: Promise<{ couponId: string }>
}

export default async function CouponsFormPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { couponId } = await params

  return (
    <div>
      <CouponsForm params={{ couponId }} />
    </div>
  )
}
