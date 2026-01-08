'use client'

import { Suspense } from 'react'
import ProductsList from '@/components/products/ProductsList'

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsList />
    </Suspense>
  )
}
