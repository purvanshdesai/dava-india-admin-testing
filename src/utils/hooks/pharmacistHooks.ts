import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPharmacist,
  deletePharmacist,
  fetchPharmacists,
  updatePharmacist
} from '../actions/pharmacistActions'

export const useCreatePharmacist = () => {
  return useMutation({
    mutationFn: createPharmacist
  })
}

export const usePatchPharmacist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePharmacist,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-pharmacist'] })
    }
  })
}

export const useFetchPharmacists = (storeId: any) => {
  return useQuery({
    queryKey: ['fetch-pharmacist', storeId],
    queryFn: () => fetchPharmacists(storeId)
  })
}

export const useDeletePharmacist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePharmacist,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-pharmacist'] })
    }
  })
}
