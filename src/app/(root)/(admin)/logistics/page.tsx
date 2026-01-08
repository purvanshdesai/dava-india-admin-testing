'use client'
import React, { Suspense } from 'react'
import LogisticsRulesList from '@/components/logistics/LogisticsRulesList'

export default function Logistics() {
  return (
    <Suspense>
      <LogisticsRulesList />
    </Suspense>
  )
}
