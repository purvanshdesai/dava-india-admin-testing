import React, { ReactElement } from 'react'
import ConsultingOrder from '@/components/inquiry/EnquiryConsultOrder'

type Props = {
  params: Promise<{ inquiryId: string }>
}

export default async function EnquiryConsultingOrderPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { inquiryId } = await params

  return (
    <div>
      <ConsultingOrder params={{ inquiryId }} />
    </div>
  )
}
