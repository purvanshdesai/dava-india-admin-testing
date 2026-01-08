'use client'
import { TStoreForm } from '@/components/stores/StoreForm'
import api from '@/lib/axios'

import { ColumnFiltersState } from '@tanstack/react-table'

export type TStoresQuery = {
  $limit: number
  $skip: number
  filters: ColumnFiltersState
}

export const handleAddNewStore = async (data: TStoreForm) => {
  try {
    const res = await api.post('/stores', { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleDeleteStore = async ({ storeId }: { storeId: string }) => {
  try {
    const res = await api.delete(`/super-admin-users/delete-store/${storeId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleEditStore = async ({
  storeId,
  data
}: {
  storeId: string
  data: TStoreForm
}) => {
  try {
    const res = await api.patch(`/stores/${storeId}`, { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetStores = async (query: any): Promise<any> => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip,
      $sort: {
        _id: -1
      },
      query: {}
    }

    for (const filter of query.filters) {
      if (filter.id == 'storeName') {
        // reqQuery.query[filter.id] = {
        //   $regex: filter.value,
        //   $options: 'i'
        // }
        reqQuery['$or'] = [
          {
            storeName: {
              $regex: filter.value,
              $options: 'i'
            }
          },
          {
            gstNumber: {
              $regex: filter.value,
              $options: 'i'
            }
          },
          {
            licenceNumber: {
              $regex: filter.value,
              $options: 'i'
            }
          },
          {
            email: {
              $regex: filter.value,
              $options: 'i'
            }
          },
          {
            city: {
              $regex: filter.value,
              $options: 'i'
            }
          },
          {
            storeCode: {
              $regex: filter.value,
              $options: 'i'
            }
          },
          {
            pincode: {
              $regex: filter.value,
              $options: 'i'
            }
          },
          {
            serviceableZip: {
              $elemMatch: { $eq: Number(filter?.value?.replace(/\D/g, '')) }
            }
          }
        ]
      } else if (filter.id == 'tableZipCode') {
        reqQuery['serviceableZip'] = {
          $in: filter.value
        }
      } else if (filter.id == 'tablePostalRange') {
        reqQuery['$and'] = [
          { serviceableZip: { $gte: Number(filter?.value?.from) } },
          { serviceableZip: { $lte: Number(filter?.value?.to) } }
        ]
      } else if (filter.id == 'active') {
        if (!reqQuery['$or']) reqQuery['$or'] = []
        for (const value of filter.value) {
          reqQuery['$or'].push({
            active: value
          })
        }
      } else if (filter.id == 'acceptedInvitation') {
        reqQuery['acceptedInvitation'] = filter.value
      } else if (filter.id == 'storeUser') {
        reqQuery.storeUserStatus = filter.value
      } else if (filter.id == 'state') {
        reqQuery['state'] = {
          $in: filter.value
        }
      }
    }

    const res = await api.get('/stores', {
      params: reqQuery
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const fetchStoresPost = async (query: {
  zipCodes?: string[]
  type: 'range' | 'zipCodes'
  range?: { from: string; to: string }
  skip: number
  limit: number
}) => {
  const resp = await api.post('/fetch-stores-post', query)
  return resp.data
}

export const handleGetStore = async (storeId: string) => {
  try {
    const res = await api.get(`/stores/${storeId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleChangeStoreActive = async ({
  storeId,
  active
}: {
  storeId: string
  active: boolean
}) => {
  try {
    const res = await api.patch(`/stores/${storeId}`, { active })
    return res.data
  } catch (error) {
    throw error
  }
}

export const resendInvitationMail = async ({
  storeId
}: {
  storeId: string
}) => {
  try {
    const res = await api.patch(`/resend-store-invite/${storeId}`, {})
    return res.data
  } catch (error) {
    throw error
  }
}
