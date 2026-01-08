import React, { ReactElement } from 'react'
import CollectionForm from '@/components/collections/CollectionForm'

type Props = {
  params: Promise<{ collectionId: string }>
}

export default async function CollectionDetailsPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { collectionId } = await params

  return (
    <div>
      <CollectionForm params={{ collectionId }} />
    </div>
  )
}
