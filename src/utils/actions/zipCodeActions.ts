'use client'

import { TZipCodeForm } from '@/components/zipCodes/ZipCodeForm'
import api from '@/lib/axios'

export const handleAddNewZipCode = async (data: TZipCodeForm) => {
  try {
    const res = await api.post(`/zip-codes`, { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetZipCodes = async (query: any) => {
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
        if (filter.id == 'zipCode') {
          reqQuery['$or'] = [
            {
              zipCode: {
                $regex: filter.value,
                $options: 'i'
              }
            },
            {
              district: {
                $regex: filter.value,
                $options: 'i'
              }
            },
            {
              state: {
                $regex: filter.value,
                $options: 'i'
              }
            }
          ]
        } else if (filter.id == 'tableZipCode') {
          reqQuery['zipCode'] = {
            $in: filter.value
          }
        } else if (filter.id == 'tablePostalRange') {
          reqQuery['zipCode'] = {
            $gte: filter?.value?.from,
            $lte: filter?.value?.to
          }
        }
      }
    }
    console.log(reqQuery)
    const res = await api.get('/zip-codes', {
      params: { ...reqQuery }
    })

    // console.log(res?.data)

    return res.data
  } catch (error) {
    throw error
  }
}

export const fetchZipCodesPost = async (query: {
  zipCodes?: string[]
  type: 'range' | 'zipCodes'
  range?: { from: string; to: string }
  skip: number
  limit: number
}) => {
  const resp = await api.post('/fetch-zip-codes-post', query)
  return resp.data
}

export const fetchZipCodes = async (query: any) => {
  try {
    const { filters } = query
    if (filters) {
      query.searchText = filters
    }
    delete query.filters
    const res = await api.get(`/admin-zip-codes`, {
      params: query
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleDeleteZipCode = async ({
  zipCodeId
}: {
  zipCodeId: string
}) => {
  try {
    const res = await api.delete(`/zip-codes/${zipCodeId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleEditZipCode = async ({
  zipCodeId,
  data
}: {
  zipCodeId: string
  data: TZipCodeForm
}) => {
  try {
    const res = await api.patch(`/zip-codes/${zipCodeId}`, { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetZipCode = async (zipCode: string) => {
  try {
    const res = await api.get(`/zip-codes/${zipCode}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetCityStateZipCode = async (zipCode: string) => {
  try {
    const res = await api.get(`/zip-codes-get/${zipCode}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleBulkUploadZipCodes = async ({
  data
}: {
  data: Array<{
    zipcode: string
    area: string
    district: string
    state: string
    latitude: number
    longitude: number
  }>
}) => {
  try {
    const res = await api.post('/zip-codes/bulk-upload', { data })
    return res.data
  } catch (error) {
    throw error
  }
}
