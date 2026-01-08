'use client'

import api from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const getStoresForChangeStore = async (orderId: string) => {
  try {
    const res = await api.get(
      '/store-admin-users/change-store?orderId=' + orderId
    )
    return res.data
  } catch (error) {
    throw error
  }
}

export const changeStore = async (data: any) => {
  try {
    const res = await api.post('/store-admin-users/change-store', { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}
export const useSuperAdminPartialOrderTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      transferredStoreId: string
      orderId: string
      currentStoreId: string
      selectedProducts: any[]
      cancelReason: string
      comment?: string
    }) => {
      const response = await api.post('super-admin-users/partial-transfer', {
        ...data
      })

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-orders'] })
      queryClient.invalidateQueries({ queryKey: ['get-order-tracking'] })
    }
  })
}
export const useStoreAdminPartialOrderTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      transferredStoreId: string
      orderId: string
      currentStoreId: string
      selectedProducts: any[]
      cancelReason: string
      comment?: string
    }) => {
      const response = await api.post('store-admin-users/partial-transfer', {
        ...data
      })

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-orders'] })
      queryClient.invalidateQueries({ queryKey: ['get-order-tracking'] })
    }
  })
}
