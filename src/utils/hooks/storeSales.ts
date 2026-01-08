import { useQuery } from '@tanstack/react-query'
import { getStoreSales } from '../actions/StoreSales'

export const useGetStoreSales = (query: any, productId: string) => {
  return useQuery({
    queryFn: () => getStoreSales(query, productId),
    queryKey: ['find-store-sales', query, productId]
  })
}
