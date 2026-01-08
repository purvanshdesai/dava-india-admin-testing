'use client'
import InventoryStoreBulkUpload from '@/components/bulk-upload/InventoryStoreBulkUpload'
import React from 'react'

const AdminBulkUpload = () => {
  return (
    <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
      <InventoryStoreBulkUpload />
    </div>
  )
}

export default AdminBulkUpload
