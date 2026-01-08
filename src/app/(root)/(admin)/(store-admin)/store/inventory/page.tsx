'use client'

import { Suspense } from 'react'
import InventoryList from '@/components/inventory/InventoryList'

export default function Inventory() {
  return (
    <Suspense>
      <InventoryList />
    </Suspense>
  )
}
