'use client'
import api from '@/lib/axios'

export const getStoreSales = async (query: any, productId: string) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip,
      productId
    }
    if (query.filters?.length) {
      for (const filter of query.filters) {
        if (filter.id == '_id') {
          reqQuery[filter.id] = {
            $regex: filter.value,
            $options: 'i'
          }
        }
      }
    }
    const res = await api.get('/sales', {
      params: { ...reqQuery }
    })
    return res.data
  } catch (error) {
    throw error
  }
}
