'use client'
import api from '@/lib/axios'

export async function verifyPharmacist({
  storeId,
  pin
}: {
  storeId: string
  pin: string
}) {
  try {
    const axiosRes = await api.get('/store-pharmacist/store-admin', {
      params: { store: storeId, pin: pin }
    })

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchPharmacistDetails(pharmacistId: string) {
  if (pharmacistId === 'new') return null
  try {
    const axiosRes = await api.get(
      `/store-pharmacist/store-admin/${pharmacistId}`
    )

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
