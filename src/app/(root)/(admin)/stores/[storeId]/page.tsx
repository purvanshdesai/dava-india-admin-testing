import React, { ReactElement } from 'react'
import StoreForm from '@/components/stores/StoreForm'

type Props = {
  params: Promise<{ storeId: string }>
}

export default async function StoreFormPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { storeId } = await params

  return (
    <div>
      <StoreForm params={{ storeId }} />
    </div>
  )
}
