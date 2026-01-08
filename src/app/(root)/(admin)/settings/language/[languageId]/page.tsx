import React, { ReactElement } from 'react'
import LanguageView from '@/components/languages/LanguageForm'

type Props = {
  params: Promise<{ languageId: string }>
}

export default async function LanguageFormPage({
  params
}: Props): Promise<ReactElement> {
  // read route params
  const { languageId } = await params

  return (
    <div>
      <LanguageView params={{ languageId }} />
    </div>
  )
}
