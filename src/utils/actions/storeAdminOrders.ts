'use client'
import api from '@/lib/axios'

export const handleGetOrders = async (query: any) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip,
      $sort: {
        _id: -1
      }
    }

    // Add userId filter if provided
    if (query.userId) {
      reqQuery.userId = query.userId
    }

    // Add excludeOrderId filter if provided (to exclude current order from previous orders)
    if (query.excludeOrderId) {
      reqQuery.excludeOrderId = query.excludeOrderId
    }

    if (query.filters?.length) {
      for (const filter of query.filters) {
        if (filter.id == 'orderId') {
          const value = filter.value?.trim() || ''

          // Search across orderId, email, and phone number only
          reqQuery['$or'] = [
            {
              orderId: {
                $regex: value,
                $options: 'i'
              }
            },
            {
              'userId.email': {
                $regex: value,
                $options: 'i'
              }
            },
            {
              'userId.phoneNumber': {
                $regex: value,
                $options: 'i'
              }
            }
          ]
        } else if (filter.id == 'status') {
          // Ensure filter.value is an array
          const statusValues = Array.isArray(filter.value)
            ? filter.value
            : [filter.value]

          if (statusValues.length > 0) {
            // Use $and to combine with existing $or filter
            const statusOrFilters = []
            for (const value of statusValues) {
              if (value) {
                // Skip empty values
                statusOrFilters.push({
                  status: value
                })
              }
            }

            if (statusOrFilters.length > 0) {
              // If there's already an $or filter (from orderId search), use $and
              if (reqQuery['$or']) {
                reqQuery['$and'] = [
                  { $or: reqQuery['$or'] },
                  { $or: statusOrFilters }
                ]
                delete reqQuery['$or']
              } else {
                reqQuery['$or'] = statusOrFilters
              }
            }
          }
        }
      }
    }

    const res = await api.get('/store-admin-users/orders', {
      params: { ...reqQuery },
      paramsSerializer: {
        indexes: null // This ensures arrays and nested objects are serialized correctly
      }
    })
    return res.data
  } catch (error) {
    throw error
  }
}
export const handleGetOrdersDownload = async (query: any) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip
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
    const res = await api.post(
      'download-excel/download-store-orders-excel',
      reqQuery
    )
    return res.data
  } catch (error) {
    throw error
  }
}
export const handleGetOrder = async (orderId: string) => {
  try {
    const res = await api.get(`/super-admin-users/orders/${orderId}`)
    return res.data
  } catch (error) {
    throw error
  }
}
