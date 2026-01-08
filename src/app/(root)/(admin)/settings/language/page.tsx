'use client'

import { Suspense } from 'react'
import LanguageList from '@/components/languages/LanguageList'

export default function LanguagesPage() {
  return (
    <Suspense>
      <LanguageList />
    </Suspense>
  )
}
