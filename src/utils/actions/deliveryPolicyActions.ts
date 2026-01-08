'use client'

import api from '@/lib/axios'

export const handleCreateDeliveryPolicy = async (data: any) => {
  try {
    const res = await api.post(`/delivery-policies`, { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetDeliveryPolices = async (query: any) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip,
      $sort: {
        _id: -1
      }
    }
    if (query.filters?.length) {
      for (const filter of query.filters) {
        if (filter.id == 'zoneName') {
          // reqQuery['zoneName'] = {
          //   $regex: filter.value,
          //   $options: 'i'
          // }
          reqQuery['$or'] = [
            {
              zoneName: {
                $regex: filter.value,
                $options: 'i'
              }
            },
            {
              postalCodes: {
                $regex: filter.value,
                $options: 'i'
              }
            }
          ]
        }
      }
    }
    const res = await api.get('/delivery-policies', {
      params: { ...reqQuery }
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetDeliveryModeTemplates = async () => {
  try {
    const res = await api.get('/delivery-mode-templates', {
      params: {}
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleEditDeliveryPolicy = async ({
  deliveryPolicyId,
  data
}: {
  deliveryPolicyId: string
  data: any
}) => {
  try {
    const res = await api.patch(`/delivery-policies/${deliveryPolicyId}`, {
      ...data
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetDeliveryPolicy = async (deliveryPolicyId: string) => {
  try {
    const res = await api.get(`/delivery-policies/${deliveryPolicyId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleDeleteDeliveryPolicy = async ({
  deliveryPolicyId
}: {
  deliveryPolicyId: string
}) => {
  try {
    const res = await api.delete(`/delivery-policies/${deliveryPolicyId}`)
    return res.data
  } catch (error) {
    throw error
  }
}
