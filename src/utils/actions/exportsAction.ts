'use client'
import api from '@/lib/axios'

export async function exportData(data: { exportFor: string; filters?: any }) {
  try {
    const axiosRes = await api.post(`/exports`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
