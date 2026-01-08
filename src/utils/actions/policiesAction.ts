'use client'

import api from '@/lib/axios'

export const createPolicy = async (data: { _id?: string; content: string; name: string }) => {
  try {
    const res = await api.post('/policies', data)
    return res.data
  } catch (error) {
    throw error
  }
}
export const fetchPolicies = async () => {
  try {
    const res = await api.get('/policies')
    return res.data ?? []
  } catch (error) {
    throw error
  }
}
