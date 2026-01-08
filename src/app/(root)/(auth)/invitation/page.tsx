import Invitation from '@/components/auth/Invitation'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Dava India | Invitation',
  description: 'Dava India Admin Application'
}

export default function InvitationPage() {
  return (
    <Suspense>
      <Invitation />
    </Suspense>
  )
}
