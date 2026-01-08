'use client'

import { Suspense } from 'react'
import Categories from '@/components/category'

export default function CategoriesPage() {
  return (
    <Suspense>
      <Categories />
    </Suspense>
  )
}
