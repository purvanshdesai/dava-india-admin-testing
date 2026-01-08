import { useQuery } from '@tanstack/react-query'
import { handleGetOrder, handleGetOrders } from '../actions/storeAdminOrders'

export const useGetStoreAdminOrders = (query: any) => {
  return useQuery({
    queryFn: () => handleGetOrders(query),
    queryKey: ['find-store-admin-orders', query]
  })
}

export const useGetStoreAdminOrder = (
  orderId: string,
  lastRefreshedAt?: Date
) => {
  return useQuery({
    queryFn: () => handleGetOrder(orderId),
    queryKey: ['get-store-admin-orders', orderId, lastRefreshedAt],
    enabled: !!orderId
  })
}
