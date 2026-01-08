import React, { ReactElement } from 'react'
import DeliveryPolicyPage from '@/components/deliveryPolicy/DeliveryPolicyForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PrescriptionOrderPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { id } = await params

  return (
    <div>
      <DeliveryPolicyPage params={{ id }} />
    </div>
  )
}
