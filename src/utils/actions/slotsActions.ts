import api from '@/lib/axios'
const API_PATH = '/consultancy-appointment-slots'

export async function fetchSlotsWithDate(date: string) {
  try {
    const axiosRes = await api.get(API_PATH, { params: { date } })
    return axiosRes?.data ?? []
  } catch (e: any) {
    return { error: true, message: 'Slot not available or fully booked!' }
  }
}
