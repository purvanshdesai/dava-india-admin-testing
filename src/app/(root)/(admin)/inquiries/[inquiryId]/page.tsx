'use client'
import { useParams } from 'next/navigation'
import TicketDetails from '@/components/inquiry/ticket-details/TicketDetails'
import AppBreadcrumb from '@/components/Breadcrumb'
import { useFetchTicketDetails } from '@/utils/hooks/ticketHooks'

export default function TicketDetailsPage() {
  const params = useParams<{ inquiryId: string }>()

  const { data, isPending } = useFetchTicketDetails(params.inquiryId)

  if (isPending) return <div>Loading...</div>

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Issues', href: '/inquiries' },
            {
              page: `Ticket: ${data?.ticketId}`
            }
          ]}
        />
      </div>
      <TicketDetails ticketDetails={data} />
    </div>
  )
}
