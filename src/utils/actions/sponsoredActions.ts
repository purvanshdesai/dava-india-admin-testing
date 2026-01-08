import api from '@/lib/axios'
import { TPaginateResponse } from '../../../types/type'

export async function createSponsoredLayout(formData: any) {
  try {
    const axiosRes = await api.post('/sponsored', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchSponsoredLayouts = async (
  query: any
): Promise<TPaginateResponse<any>> => {
  try {
    const reqQuery: any = {
      $limit: query.$limit || 100,
      $skip: query.$skip || 0
      // query: {}
    }
    if (query.filters) {
      for (const filter of query.filters) {
        if (filter.id == 'sectionName') {
          reqQuery.sectionName = {
            $regex: filter.value,
            $options: 'i'
          }
        }
        if (filter.id == 'isActive') {
          reqQuery.isActive = filter.value[0]
        }
        if (filter.id == 'type') {
          reqQuery.type = filter.value[0]
        }
      }
    }

    const res = await api.get('/sponsored', {
      params: reqQuery
    })

    return res.data ?? res.data
  } catch (error) {
    throw error
  }
}

export async function fetchSponsorDetailById(id: string) {
  try {
    const axiosRes = await api.get('/sponsored/' + id)
    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateSponsorLayout(formData: any) {
  try {
    const { _id, ...data } = formData
    const axiosRes = await api.patch(`/sponsored/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function deleteSponsorLayout(sponsorId: string) {
  try {
    const axiosRes = await api.delete(`/sponsored/${sponsorId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function reorderSponsoredLayouts(data: any) {
  try {
    const axiosRes = await api.post('/sponsored/layout-positioning', data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
