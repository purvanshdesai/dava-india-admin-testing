import api from '@/lib/axios'
import { ColumnFiltersState } from '@tanstack/react-table'

export type TInventoryQuery = {
  storeId?: string
  productId?: string
  limit?: number
  skip?: number
  paginate?: boolean
  filters?: ColumnFiltersState
}

export const fetchStoreInventory = async (query: TInventoryQuery) => {
  try {
    const { filters, ...requestQuery }: any = query
    for (const filter of filters) {
      if (filter.id === 'product') {
        requestQuery['productName'] = filter.value
      }
    }
    const axiosRes = await api.get(`/store-inventory`, {
      params: {
        ...requestQuery
      }
    })

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchInventoryById = async (id: string) => {
  try {
    const axiosRes = await api.get(`/store-inventory/${id}`)
    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const updateInventory = async (data: {
  _id: string
  quantity: number
  operation: string
  reason?: string
}) => {
  try {
    const { _id, ...updateData } = data
    const axiosRes = await api.put(`/store-inventory/${_id}`, updateData)
    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchProductStockEntries = async (query: TInventoryQuery) => {
  try {
    const axiosRes = await api.get(`/inventory-stock`, {
      params: query
    })

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const getStoreSales = async (query: any, productId: string) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip,
      productId
    }

    if (query.filters?.length) {
      for (const filter of query.filters) {
        if (filter.id == 'orderId') {
          reqQuery[filter.id] = filter?.value
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

export const addProductToInventory = async (data: {
  stock: number
  productId: string
  storeId: string
  batchNo: string
  expiryDate: string
}) => {
  try {
    const axiosRes = await api.post(`/store-inventory`, data)
    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchProductListForInventory = async (query: TInventoryQuery) => {
  try {
    const axiosRes = await api.get(`/store-inventory/products`, {
      params: query
    })

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
