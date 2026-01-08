'use client'
import api from '@/lib/axios'

const API_PATH = '/notifications'

export const fetchNotifications = async (query: any) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip,
      $sort: {
        _id: -1
      }
    }
    const res = await api.get(API_PATH, {
      params: {
        ...reqQuery
      }
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const patchNotification = async ({
  id,
  data
}: {
  id: string
  data: any
}) => {
  try {
    const res = await api.patch(`${API_PATH}/${id}`, { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const markAllAsRead = async () => {
  try {
    const res = await api.patch(
      `${API_PATH}`,
      {},
      {
        params: {
          controller: 'markAllAsRead'
        }
      }
    )
    return res.data
  } catch (error) {
    throw error
  }
}
