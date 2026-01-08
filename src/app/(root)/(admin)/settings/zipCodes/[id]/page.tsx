import React, { ReactElement } from 'react'
import ZipCodeForm from '@/components/zipCodes/ZipCodeForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ZipCodeFormPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { id } = await params

  return (
    <div>
      <ZipCodeForm params={{ id }} />
    </div>
  )
}
