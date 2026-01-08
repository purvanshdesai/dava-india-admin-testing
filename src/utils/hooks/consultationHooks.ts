import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createConsultation,
  getConsultationFromTicket
} from '../actions/consultationActions'

export const useCreateConsultation = () => {
  return useMutation({
    mutationFn: createConsultation
  })
}

export const useGetConsultationFromTicket = (ticketId: any) => {
  return useQuery({
    queryKey: ['fetch-consultation-ticket', ticketId],
    queryFn: () => getConsultationFromTicket(ticketId)
  })
}
