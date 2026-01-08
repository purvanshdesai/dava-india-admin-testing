import React, { ReactElement } from 'react'
import CategoryForm from '@/components/category/CategoryForm'

type Props = {
  params: Promise<{ categoryId: string }>
}

export default async function CategoryDetailsPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { categoryId } = await params

  return (
    <div>
      <CategoryForm params={{ categoryId }} />
    </div>
  )
}
