'use client'
import api from '@/lib/axios'

export async function fetchSuperAdminUsers(query: any) {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip
    }

    if (query.filters?.length) {
      for (const filter of query.filters) {
        if (filter.id == 'email') {
          reqQuery[filter.id] = {
            $regex: filter.value,
            $options: 'i'
          }
        }
        if (filter.id == 'isActive') {
          reqQuery.isActive = filter.value[0]
        }
      }
    }

    const res = await api.get('/super-admin-users', {
      params: reqQuery
    })

    return res.data
  } catch (error) {
    throw error
  }
}

export const handleEditSuperAdminUser = async ({
  superId,
  data
}: {
  superId: string
  data: any
}) => {
  try {
    const res = await api.patch(`/super-admin-users/${superId}`, {
      ...data
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleDeleteSuperAdminUser = async ({
  superId
}: {
  superId: string
}) => {
  try {
    const res = await api.delete(`/super-admin-users/${superId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const superAdminForgotPassword = async ({
  email
}: {
  email: string
}) => {
  try {
    const res = await api.post('/super-admin-users/forgot-password', { email })
    return res.data
  } catch (error) {
    throw error
  }
}

export const superAdminResetPassword = async ({
  token,
  newPassword
}: {
  token: string
  newPassword: string
}) => {
  try {
    const res = await api.patch(`/super-admin-users/reset-password/${token}`, {
      newPassword
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const superAdminCheckTokenValidity = async (token: string) => {
  try {
    const res = await api.get(`/super-admin-users/reset-password/${token}`)
    return res.data
  } catch (error) {
    throw error
  }
}
