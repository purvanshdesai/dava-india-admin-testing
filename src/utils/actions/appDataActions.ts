'use client'
import api from '@/lib/axios'
const API_URL = '/app-data'

export const handleGetAllLanguages = async () => {
  try {
    const res = await api.get(API_URL, {
      params: { type: 'language' }
    })

    // console.log(res)

    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
export const handleGetAllConsumptions = async () => {
  try {
    const res = await api.get(API_URL, {
      params: { type: 'consumption' }
    })

    // console.log(res)

    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
export const handleGetAllTaxes = async () => {
  try {
    const res = await api.get(API_URL, {
      params: { type: 'taxes' }
    })

    // console.log(res)

    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
export const AddTaxesType = async (data: any) => {
  try {
    const res = await api.post(API_URL, { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetStoreTransferReason = async () => {
  try {
    const res = await api.get(API_URL, {
      params: { type: 'store-transfer-reason' }
    })

    // console.log(res)

    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
