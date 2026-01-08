import { useMutation, useQuery } from '@tanstack/react-query'
import {
  changeStoreSuperAdmin,
  getStoresForSuperAdminChangeStore
} from '../actions/changeStoreSuperAdmin'

export const useGetSuperAdminStoresForChange = (
  storeId: string,
  orderId: string
) => {
  return useQuery({
    queryFn: () => getStoresForSuperAdminChangeStore(storeId, orderId),
    queryKey: ['find-change-super-admin-stores', storeId]
  })
}

export const useChangeStoreSuperAdmin = () => {
  return useMutation({
    mutationFn: changeStoreSuperAdmin
  })
}
