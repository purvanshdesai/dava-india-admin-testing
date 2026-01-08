'use client'
import api from '@/lib/axios'
import { TPaginateResponse } from '../../../types/type'

export async function createCoupon(formData: any) {
  try {
    const axiosRes = await api.post('/coupons', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateCoupon(formData: any) {
  try {
    const { _id, ...data } = formData
    const axiosRes = await api.patch(`/coupons/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchCouponDetails(couponId: string) {
  if (couponId === 'new') return null
  try {
    const axiosRes = await api.get(`/coupons/${couponId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchCoupons = async (
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
        if (filter.id == 'couponName') {
          reqQuery.query['$or'] = [
            { couponName: { $regex: filter.value, $options: 'i' } },
            { couponCode: { $regex: filter.value, $options: 'i' } }
          ]
        }
        if (filter.id == 'active') {
          reqQuery.query.active = filter.value[0]
        }
        if (filter.id == 'usageLimit') {
          reqQuery.query.usageLimit = filter.value[0]
        }
        if (filter.id == 'discountType') {
          reqQuery.query.discountType = filter.value[0]
        }
      }
    }

    const res = await api.get('/coupons', {
      params: reqQuery
    })

    return res.data ?? res.data
  } catch (error) {
    throw error
  }
}

export async function deleteCoupon(couponId: string) {
  try {
    const axiosRes = await api.delete(`/coupons/${couponId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
