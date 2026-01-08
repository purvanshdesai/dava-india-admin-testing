import api from '@/lib/axios'

export const handleGetOrders = async (query: any) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip,
      $sort: {
        _id: -1
      },
      dateRange: query.dateRange
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

          // Skip if empty value
          if (!value) {
            continue
          }

          // Search across orderId, email, phone number, store code, and store name
          const orFilters = [
            {
              orderId: { $regex: value, $options: 'i' }
            },
            {
              'userId.email': { $regex: value, $options: 'i' }
            },
            {
              'userId.phoneNumber': { $regex: value, $options: 'i' }
            },
            {
              'store.storeCode': { $regex: value, $options: 'i' }
            }
          ]

          reqQuery['$or'] = orFilters
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
        } else if (filter.id == 'payment') {
          // Ensure paymentMethod is always an array
          reqQuery.paymentMethod = Array.isArray(filter.value)
            ? filter.value
            : [filter.value]
        } else if (filter.id == 'lastTimelineStatus') {
          // Ensure timelineStatus is always an array
          reqQuery.timelineStatus = Array.isArray(filter.value)
            ? filter.value
            : [filter.value]
        } else if (filter.id == 'deliveryMode') {
          // Ensure deliveryMode is always an array
          reqQuery.deliveryMode = Array.isArray(filter.value)
            ? filter.value
            : [filter.value]
        } else if (filter.id == 'hasDavaoneMembership') {
          // Add filter for DavaOne membership
          // The API will handle the lookup and filtering
          // Handle array of values from faceted filter
          const values = Array.isArray(filter.value)
            ? filter.value
            : filter.value
              ? [filter.value]
              : []
          // If only one value is selected, use it directly
          if (values.length === 1) {
            // Convert to boolean - send as string to avoid URL encoding issues
            reqQuery['userId.hasDavaoneMembership'] =
              values[0] === 'true' ? 'true' : 'false'
          } else if (values.length > 1) {
            // If multiple values, we need to use $or (but typically faceted filters are single select)
            // For now, if both are selected, don't filter (show all)
            // This shouldn't happen with faceted filters, but handle it gracefully
            delete reqQuery['userId.hasDavaoneMembership']
          }
        }
      }
    }

    const res = await api.get('/super-admin-users/orders', {
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

export const handleGetOrder = async (orderId: string) => {
  try {
    const res = await api.get(`/super-admin-users/orders/${orderId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const addProductBatchNo = async (data: {
  orderId: string
  userType: 'super-admin' | 'store-admin'
  storeId: string
  productBatches: { productId: string; batchNo: string }[]
}) => {
  try {
    const { orderId, userType, ...requestData } = data
    const res = await api.patch(
      `/${userType}-users/orders/${orderId}/products/batches`,
      requestData
    )
    return res.data
  } catch (error) {
    throw error
  }
}
export const reprocessCheckoutFailedOrder = async ({ data }: any) => {
  try {
    const res = await api.post(`/checkout-session-failed-order`, data)
    return res.data
  } catch (error) {
    throw error
  }
}

export const downloadOrderInvoice = async (orderTrackingId: string) => {
  const res = await api.get(`/downloads/invoice/${orderTrackingId}`)
  return res.data
}

export const changeOrderDeliveryMode = async ({ data }: any) => {
  try {
    const { orderId, userType, ...modeData } = data
    const res = await api.patch(
      `/${userType}-users/orders/${orderId}`,
      modeData
    )
    return res.data
  } catch (error) {
    throw error
  }
}

export const requestToCreatePrescription = async ({
  orderId,
  dateOfConsult,
  timeOfConsult
}: any) => {
  try {
    const res = await api.post(`/create-ticket-from-admin`, {
      orderId,
      dateOfConsult,
      timeOfConsult
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const skipOrderLogistics = async ({
  orderId,
  orderTrackingId,
  skipLogistics
}: any) => {
  try {
    const res = await api.put(
      `/super-admin-users/orders/skip-logistics/${orderId}`,
      { skipLogistics, orderTrackingId }
    )
    return res.data
  } catch (error) {
    throw error
  }
}

export const cancelAdminOrderItems = async (data: {
  orderId: string
  productTrackingId: string
  items: any[]
  reasonCode: string
  notes: string
}) => {
  try {
    const res = await api.post(`/super-admin-users/orders/cancel`, {
      ...data
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const modifyReturn = async ({
  orderItemTrackingId,
  orderItemId,
  returnQuantity
}: any) => {
  try {
    const res = await api.post(`/super-admin-users/orders/modify-return`, {
      orderItemTrackingId,
      orderItemId,
      returnQuantity
    })
    return res.data
  } catch (error) {
    throw error
  }
}
