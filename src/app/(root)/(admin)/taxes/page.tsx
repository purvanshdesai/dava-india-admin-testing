import React, { Suspense } from 'react'
import TaxesList from '@/components/Taxes/TaxesList'
const Taxes = () => {
  return (
    <Suspense>
      <TaxesList />
    </Suspense>
  )
}

export default Taxes
