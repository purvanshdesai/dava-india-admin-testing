'use client'
import api from '@/lib/axios'

export const handleRejectPrescription = async ({
  orderId,
  status,
  storeId
}: {
  orderId: string
  status: string
  storeId: string
}) => {
  try {
    const res = await api.post('/store-admin-users/prescription-status', {
      orderId,
      status,
      storeId
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleAcceptPrescription = async ({
  orderId,
  storeId
}: {
  orderId: string
  storeId: string
}) => {
  try {
    const res = await api.post('/store-admin-users/prescription-status', {
      orderId,
      status: 'accept',
      storeId
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleStoreOrderPrescriptionStateChange = async ({
  orderId,
  status,
  storeId,
  orderTrackingId
}: {
  orderId: string
  status: 'accept' | 'reject'
  storeId: string
  orderTrackingId: string
}) => {
  try {
    const res = await api.post('/store-admin-users/prescription-status', {
      orderId,
      status,
      storeId,
      orderTrackingId
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const ticketPrescription = async (data: any) => {
  try {
    const res = await api.post('/prescription-status', {
      ...data
    })
    return res.data
  } catch (error) {
    throw error
  }
}
