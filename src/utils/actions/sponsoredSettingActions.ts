import api from '@/lib/axios'
import { TPaginateResponse } from '../../../types/type'

export async function createSponsored(formData: any) {
  try {
    const axiosRes = await api.post('/sponsored-settings', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchSponsorDetails = async (
  query: any
): Promise<TPaginateResponse<any>> => {
  try {
    const reqQuery: any = {
      $limit: query.$limit || 10,
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

    const res = await api.get('/sponsored-settings', {
      params: reqQuery
    })

    return res.data ?? res.data
  } catch (error) {
    throw error
  }
}

export async function fetchSponsorDetailById(id: string) {
  try {
    const axiosRes = await api.get('/sponsored-settings/' + id)
    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateSponsorDetails(formData: any) {
  try {
    const { _id, ...data } = formData
    const axiosRes = await api.patch(`/sponsored-settings/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function deleteSponsor(sponsorId: string) {
  try {
    const axiosRes = await api.delete(`/sponsored-settings/${sponsorId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
