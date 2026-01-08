'use client'

import api from '@/lib/axios'

const API = '/consultations'

export const createConsultation = async (data: any) => {
  try {
    return await api.post(API, { ...data })
  } catch (error) {
    throw error
  }
}

export const getConsultationFromTicket = async (ticketId: any) => {
  try {
    const res = await api.get(`consultation-items/${ticketId}`)
    return res.data
  } catch (error) {
    throw error
  }
}
