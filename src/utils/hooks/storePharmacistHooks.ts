import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchPharmacistDetails,
  verifyPharmacist
} from '../actions/storePharmacistActions'

export const useVerifyPharmacist = () => {
  return useMutation({
    mutationFn: verifyPharmacist
  })
}

export const useFetchPharmacistDetails = (pharmacistId: any) => {
  return useQuery({
    queryKey: ['fetch-pharmacist-details', pharmacistId],
    queryFn: () => fetchPharmacistDetails(pharmacistId)
  })
}
