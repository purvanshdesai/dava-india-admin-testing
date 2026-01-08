'use client'
import api from '@/lib/axios'

export async function updateStoreSettings(formData: any) {
  try {
    const { _id, ...data } = formData
    const axiosRes = await api.patch(`/store-settings/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
export async function fetchStoreSettings() {
  try {
    const axiosRes = await api.get(`/store-settings`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
