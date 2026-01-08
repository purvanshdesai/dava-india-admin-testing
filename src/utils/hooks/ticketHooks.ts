import { useMutation, useQuery } from '@tanstack/react-query'
import {
  addActivity,
  fetchAssignee,
  fetchTicketDetails,
  fetchTickets,
  setAssignee,
  updateTicket
} from '@/utils/actions/ticketActions'

export const useFetchTickets = (query?: any) => {
  return useQuery({
    queryFn: () => fetchTickets(query),
    queryKey: ['fetch-tickets', query],
    gcTime: 0
  })
}

export const useFetchTicketDetails = (ticketId: string) => {
  return useQuery({
    queryKey: ['fetch-ticket-details', ticketId],
    queryFn: () => fetchTicketDetails(ticketId),
    gcTime: 0
  })
}

export const usePatchTicket = () => {
  return useMutation({ mutationFn: updateTicket })
}

export const useAddActivity = () => {
  return useMutation({ mutationFn: addActivity })
}

export const useFetchAssignee = (ticketId: string) => {
  return useQuery({
    queryFn: () => fetchAssignee(ticketId),
    queryKey: ['fetch-assignee', ticketId],
    gcTime: 0
  })
}

export const useSetAssignee = () => {
  return useMutation({ mutationFn: setAssignee })
}
