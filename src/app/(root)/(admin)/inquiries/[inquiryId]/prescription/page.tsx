import React, { ReactElement } from 'react'
import PrescriptionOrder from '@/components/inquiry/PrescriptionOrder'

type Props = {
  params: Promise<{ inquiryId: string }>
}

export default async function PrescriptionOrderPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { inquiryId } = await params

  return (
    <div>
      <PrescriptionOrder params={{ inquiryId }} />
    </div>
  )
}
