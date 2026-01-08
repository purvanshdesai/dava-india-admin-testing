'use client'
import { TCategoryForm } from '@/components/collections/CollectionForm'
import api from '@/lib/axios'
import { TPaginateResponse } from '../../../types/type'
import { ColumnFiltersState } from '@tanstack/react-table'

export type TCategoryQuery = {
  $limit?: number
  $skip?: number
  $paginate?: boolean
  filters?: ColumnFiltersState
}

export const handleGetAllCategories = async (type: string) => {
  try {
    const res = await api.get('/categories', { params: type })

    return res.data
  } catch (error) {
    throw error
  }
}

export const handleAddNewCategory = async (data: TCategoryForm) => {
  try {
    const res = await api.post('/categories', { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleDeleteCategory = async ({
  categoryId
}: {
  categoryId: string
}) => {
  try {
    const res = await api.delete(`/categories/${categoryId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleEditCategory = async ({
  categoryId,
  data
}: {
  categoryId: string
  data: TCategoryForm
}) => {
  try {
    const res = await api.patch(`/categories/${categoryId}`, {
      ...data
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetCategories = async (
  query: TCategoryQuery
): Promise<TPaginateResponse<TCategoryForm>> => {
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
        } else if (filter.id == 'type') {
          reqQuery.query['type'] = filter.value
        }
      }
    }

    const res = await api.get('/categories', {
      params: reqQuery
    })

    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetCategory = async (categoryId: string) => {
  try {
    const res = await api.get(`/categories/${categoryId}`)
    return res.data
  } catch (error) {
    throw error
  }
}
