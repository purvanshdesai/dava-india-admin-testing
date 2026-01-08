'use client'

import api from '@/lib/axios'

export const resetPassword = async ({
  token,
  newPassword
}: {
  token: string
  newPassword: string
}) => {
  try {
    const res = await api.patch(`/store-admin-users/reset-password/${token}`, {
      newPassword
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const checkTokenValidity = async (token: string) => {
  try {
    const res = await api.get(`/store-admin-users/reset-password/${token}`)
    return res.data
  } catch (error) {
    throw error
  }
}
