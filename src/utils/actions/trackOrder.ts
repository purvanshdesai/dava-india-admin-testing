'use client'
import api from '@/lib/axios'

export async function updateTrackOrderTimeLine(formData: any) {
  try {
    const { _id, data, storeId, productBatches } = formData
    const axiosRes = await api.post(`/store/order/${_id}/activity`, {
      ...data,
      storeId,
      productBatches
    })

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
export async function deleteLastNodeOfTrackOrderTimeLine(formData: any) {
  try {
    const { _id } = formData
    const axiosRes = await api.delete(`/store/order/${_id}/activity`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
export async function getTrackOrdersStatus(
  orderId: any,
  author: any,
  storeId: any,
  orderItemTrackingId: any
) {
  try {
    const axiosRes = await api.get(`/store/order/${orderId}/activity`, {
      params: { author: author, storeId: storeId, orderItemTrackingId }
    })

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function syncOrderTimeline(formData: {
  orderId: string
  awbNo: string
  orderTrackingId: string
}) {
  console.log(formData)

  try {
    const axiosRes = await api.post(`/store/order/${formData?.orderId}/sync`, {
      ...formData
    })

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
