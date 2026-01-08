import api from '@/lib/axios'
import { TPaginateResponse } from '../../../types/type'

export async function createSponsoredBanner(formData: any) {
  try {
    const axiosRes = await api.post('/sponsored-banners', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchSponsoredBanners = async (
  sponsoredId: any
): Promise<TPaginateResponse<any>> => {
  try {
    const res = await api.get('/sponsored-banners', {
      params: { sponsoredId }
    })

    return res.data ?? res.data
  } catch (error) {
    throw error
  }
}

export async function fetchSponsoredBannerById(id: string) {
  try {
    const axiosRes = await api.get('/sponsored-banners/' + id)
    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateSponsoredBanner(formData: any) {
  try {
    const { _id, ...data } = formData
    const axiosRes = await api.patch(`/sponsored-banners/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function deleteSponsoredBanner(bannerId: string) {
  try {
    const axiosRes = await api.delete(`/sponsored-banners/${bannerId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
