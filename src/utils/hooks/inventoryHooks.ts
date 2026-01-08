import {
  addProductToInventory,
  fetchInventoryById,
  fetchProductListForInventory,
  fetchProductStockEntries,
  fetchStoreInventory,
  getStoreSales,
  TInventoryQuery,
  updateInventory
} from '@/utils/actions/inventoryActions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useFetchInventory = (query: TInventoryQuery) => {
  return useQuery({
    queryFn: () => fetchStoreInventory(query),
    queryKey: ['fetch-store-inventory', query],
    gcTime: 0
  })
}

export const useFetchInventoryById = (id: string) => {
  return useQuery({
    queryFn: () => fetchInventoryById(id),
    queryKey: ['fetch-inventory-by-id', id]
  })
}

export const useUpdateInventory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateInventory,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['fetch-product-stock-entries']
      })
    }
  })
}

export const useFetchProductStockEntries = (query: TInventoryQuery) => {
  return useQuery({
    queryFn: () => fetchProductStockEntries(query),
    queryKey: ['fetch-product-stock-entries', query],
    gcTime: 0
  })
}

export const useGetStoreSales = (query: any, productId: string) => {
  return useQuery({
    queryFn: () => getStoreSales(query, productId),
    queryKey: ['find-store-sales', query, productId]
  })
}

export const useAddProductToInventory = () => {
  return useMutation({ mutationFn: addProductToInventory })
}

export const useFetchProductListForInventory = (query: TInventoryQuery) => {
  return useQuery({
    queryFn: () => fetchProductListForInventory(query),
    queryKey: ['fetch-inventory-product', query],
    gcTime: 0
  })
}
