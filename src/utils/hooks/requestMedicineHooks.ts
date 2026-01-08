import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchRequestMedicineById,
  fetchRequestMedicines,
  updateRequestMedicine
} from '../actions/requestMedicineAction'

export function useFetchMedicineRequests(query: any) {
  return useQuery({
    queryKey: ['medicine-requests', query],
    queryFn: () => fetchRequestMedicines(query)
  })
}

export function useFetchMedicineRequestById(_id?: string) {
  return useQuery({
    queryKey: ['medicine-request', _id],
    enabled: !!_id,
    queryFn: () => fetchRequestMedicineById(_id ?? '')
  })
}

export const useUpdateRequestMedicine = () => {
  return useMutation({
    mutationFn: updateRequestMedicine
  })
}
