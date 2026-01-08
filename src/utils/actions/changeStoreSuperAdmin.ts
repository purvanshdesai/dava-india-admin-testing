'use client'

import api from '@/lib/axios'

export const getStoresForSuperAdminChangeStore = async (
  storeId: string,
  orderId: string
) => {
  try {
    const res = await api.get('/super-admin-users/change-store', {
      params: {
        storeId,
        orderId
      }
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const changeStoreSuperAdmin = async (data: any) => {
  try {
    const res = await api.post('/super-admin-users/change-store', { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}
