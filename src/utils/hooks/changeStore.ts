import { useMutation, useQuery } from '@tanstack/react-query'
import { changeStore, getStoresForChangeStore } from '../actions/changeStore'

export const useGetStoresForChange = (orderId: string) => {
  return useQuery({
    queryFn: () => getStoresForChangeStore(orderId),
    queryKey: ['find-change-store']
  })
}

export const useChangeStore = () => {
  return useMutation({
    mutationFn: changeStore
  })
}
