'use client'
import api from '@/lib/axios'

export async function createPharmacist(formData: any) {
  try {
    const axiosRes = await api.post('/store-pharmacist', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updatePharmacist(formData: any) {
  try {
    const { _id, ...data } = formData
    const axiosRes = await api.patch(`/store-pharmacist/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchPharmacists = async (storeId: any) => {
  try {
    if (!storeId) return []

    const res = await api.get('/store-pharmacist', {
      params: { store: storeId }
    })

    return res.data ?? []
  } catch (error) {
    throw error
  }
}

export async function deletePharmacist(pharmacistId: string) {
  try {
    const axiosRes = await api.delete(`/store-pharmacist/${pharmacistId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
