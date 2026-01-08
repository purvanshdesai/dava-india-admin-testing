import React, { ReactElement } from 'react'
import SponsorSectionForm from '@/components/sponsored/SponsoredForm'

type Props = {
  params: Promise<{ _id: string }>
}

export default async function SponsoredFormPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { _id } = await params

  return (
    <div>
      <SponsorSectionForm params={{ _id }} />
    </div>
  )
}
