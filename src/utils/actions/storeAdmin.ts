import api from '@/lib/axios'

export const getStoreAdminDetails = async () => {
  try {
    const res = await api.get('/store-admin-users', {})
    return res.data
  } catch (error) {
    throw error
  }
}

export const storeAdminForgotPassword = async ({
  email
}: {
  email: string
}) => {
  try {
    const res = await api.post('/store-admin-users/forgot-password', { email })
    return res.data
  } catch (error) {
    throw error
  }
}
