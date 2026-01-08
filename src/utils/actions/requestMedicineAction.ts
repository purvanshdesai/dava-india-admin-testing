'use client'
import api from '@/lib/axios'
import { ColumnFiltersState } from '@tanstack/react-table'

export type TRequestMedicineQuery = {
  $limit?: number
  $skip?: number
  filters?: ColumnFiltersState
}

export async function fetchRequestMedicines(query: TRequestMedicineQuery) {
  try {
    const reqQuery: any = {
      $limit: query.$limit || 10,
      $skip: query.$skip || 0
    }


    const axiosRes = await api.get('/admin/medicine-requests', {
      params: reqQuery
    })
    return axiosRes?.data ?? []
  } catch (e) {
    console.log(e)
    return []
  }
}

export const fetchRequestMedicineById = async (id: string) => {
  try {
    const res = await api.get(`/admin/medicine-requests/${id}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export async function updateRequestMedicine(data: {
  requestId: string
  status: string
}) {
  try {
    const axiosRes = await api.patch(
      `/admin/medicine-requests/${data.requestId}`,
      { status: data.status }
    )

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function exportRequestMedicines(filters?: any) {
  try {
    const axiosRes = await api.post('/exports', {
      exportFor: 'medicine-requests',
      filters: filters
    })
    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
