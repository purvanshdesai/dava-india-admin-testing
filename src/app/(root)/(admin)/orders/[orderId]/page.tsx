import React, { ReactElement } from 'react'
// import OrderDetails from '@/components/orders/OrderDetails'
import OrderDetails from '@/components/OrderDetails/OrderDetails'

type Props = {
  params: Promise<{ orderId: string }>
}

export default async function PrescriptionOrderPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { orderId } = await params

  return (
    <div>
      <OrderDetails params={{ orderId }} />
    </div>
  )
}
