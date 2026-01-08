'use client'
import api from '@/lib/axios'
import { TPaginateResponse } from '../../../types/type'

export async function createCollection(formData: any) {
  try {
    const axiosRes = await api.post('/collections', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
export const fetchCollections = async (
  query: any
): Promise<TPaginateResponse<any>> => {
  try {
    const reqQuery: any = {
      $limit: query.$limit || 10,
      $skip: query.$skip || 0,
      query: {}
    }
    if (query.filters) {
      for (const filter of query.filters) {
        if (filter.id == 'name') {
          reqQuery.query = {
            name: { $regex: filter.value, $options: 'i' }
          }
        }
      }
    }

    const res = await api.get('/collections', {
      params: reqQuery
    })

    return res.data ?? res.data
  } catch (error) {
    throw error
  }
}

export async function updateCollection(formData: any) {
  try {
    const { _id, ...data } = formData

    const axiosRes = await api.patch(`/collections/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function handleGetCollection(collectionId: string) {
  if (collectionId === 'new') return null
  try {
    const axiosRes = await api.get(`/collections/${collectionId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const handleGetAllCollections = async () => {
  try {
    const res = await api.get('/collections')

    return res.data
  } catch (error) {
    throw error
  }
}

export async function deleteCollection(collectionId: string) {
  try {
    const axiosRes = await api.delete(`/collections/${collectionId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
