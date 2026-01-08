'use client'

import RequestMedicineList from '@/components/medicine-requests/requestMedicienList'
import React, { Suspense } from 'react'

export default function RequestMedicienPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading medicine requests...</div>}>
      <RequestMedicineList />
    </Suspense>
  )
}
