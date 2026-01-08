'use client'
import api from '@/lib/axios'

export const handleUploadInvoice = async (data: {
  invoiceUrl: string
  orderId: string
}) => {
  try {
    const res = await api.post('/upload-invoice', { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}
