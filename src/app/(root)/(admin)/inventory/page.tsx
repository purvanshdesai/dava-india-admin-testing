'use client'
import React from 'react'
import BulkUploadProcessTable from '@/components/bulkUploadProcess'
import { Suspense } from 'react'

const BulkUploadProcessPage = () => {
  return (
    <div>
      <Suspense>
        <BulkUploadProcessTable />
      </Suspense>
    </div>
  )
}

export default BulkUploadProcessPage
