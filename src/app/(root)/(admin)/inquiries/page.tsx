'use client'
import TicketsList from '@/components/inquiry/tickets/Tickets'
import { Suspense } from 'react'

export default function InquiriesPage() {
  return (
    <Suspense>
      <TicketsList />
    </Suspense>
  )
}
