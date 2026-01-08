'use client'

import { Suspense } from 'react'
import ZipCodeList from '@/components/zipCodes/zipCodeList'

export default function ZipCodePage() {
  return (
    <Suspense>
      <ZipCodeList />
    </Suspense>
  )
}
