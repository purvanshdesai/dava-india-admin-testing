'use client'
import api from '@/lib/axios'
import { ColumnFiltersState } from '@tanstack/react-table'

export type TUsersQuery = {
  $limit: number
  $skip: number
  filters: ColumnFiltersState
}

export async function fetchUsers(query: TUsersQuery) {
  try {
    const reqQuery: any = {
      $limit: query.$limit || 10,
      $skip: query.$skip || 0,
      $sort: {
        _id: -1
      },
      query: {}
    }

    if (query.filters?.length) {
      for (const filter of query.filters as any[]) {
        if (filter.id == 'name') {
          const fValue = filter.value?.trim() || ''
          const orFilters: any[] = []

          const value = fValue.replace('+91', '')
          const isNumeric = /^\d+$/.test(value)
          const isTenDigitMobile = /^\d{10}$/.test(value)

          if (isNumeric) {
            if (isTenDigitMobile) {
              // Case 2: also check phoneNumber
              orFilters.push({
                phoneNumber: { $regex: value, $options: 'i' }
              })
            }
          } else {
            // Case 3: string → search across all
            orFilters.push({
              name: { $regex: value, $options: 'i' }
            })
            orFilters.push({
              email: { $regex: value, $options: 'i' }
            })
          }

          reqQuery['$or'] = orFilters
        }
      }
    }

    const axiosRes = await api.get('/users/admin-access', { params: reqQuery })
    return axiosRes?.data ?? []
  } catch (e) {
    console.log(e)
    return []
  }
}

export const fetchUserById = async (id: string) => {
  try {
    const res = await api.get(`/users/admin-access/${id}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export async function creditDavaCoinsToUser(data: any) {
  try {
    const axiosRes = await api.patch(
      `/users/admin-access/${data?.customerId}`,
      data
    )

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
