'use client'
import api from '@/lib/axios'
import { ColumnFiltersState } from '@tanstack/react-table'

export type TCategoryQuery = {
  $limit?: number
  $skip?: number
  $paginate?: boolean
  filters?: ColumnFiltersState
}

export const handleAddNewTax = async (data: any) => {
  try {
    const res = await api.post('/taxes', { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetAllTaxes = async (query: any) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit == undefined ? 10 : query.$limit,
      $skip: query.$skip == undefined ? 0 : query.$skip,
      query: {}
    }
    if (query.filters) {
      for (const filter of query.filters) {
        if (filter.id == 'name') {
          reqQuery.query[filter.id] = {
            $regex: filter.value,
            $options: 'i'
          }
        }
      }
    }
    const res = await api.get('/taxes', { params: reqQuery })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetTax = async (taxId: string) => {
  try {
    const res = await api.get(`/taxes/${taxId}`)
    return res.data
  } catch (error) {
    throw error
  }
}
export const handleEditTax = async ({
  taxId,
  data
}: {
  taxId: string
  data: any
}) => {
  try {
    const res = await api.patch(`/taxes/${taxId}`, {
      ...data
    })
    return res.data
  } catch (error) {
    throw error
  }
}
export const handleDeleteTax = async ({ taxId }: { taxId: string }) => {
  try {
    const res = await api.delete(`/taxes/${taxId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleDefaultTax = async (data: any) => {
  try {
    const res = await api.post('/application-tax', { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetAllDefaultTaxes = async () => {
  try {
    const res = await api.get('/application-tax', {})
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleUpdateDefault = async ({
  id,
  data
}: {
  id: string
  data: any
}) => {
  try {
    const res = await api.patch(`/application-tax/${id}`, {
      ...data
    })
    return res.data
  } catch (error) {
    throw error
  }
}
