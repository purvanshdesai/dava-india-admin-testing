import Axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
})

// api.interceptors.request.use(async config => {
//   const session = await getSession()

//   config.headers.Authorization = `Bearer ${session?.accessToken}`

//   return config
// })

api.interceptors.request.use(
  async function (config) {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers['Authorization'] = 'Bearer ' + session?.accessToken
    }
    return config
  },
  function (error: any) {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  function (response) {
    return response
  },
  async function (error) {
    // Check if the error is due to authentication failure
    if (
      error?.response?.status === 401 ||
      error?.response?.data?.name === 'NotAuthenticated' ||
      error?.response?.data?.message?.includes('token') ||
      error?.response?.data?.message?.includes('expired')
    ) {
      // Sign out the user and redirect to login
      await signOut({
        redirect: true,
        callbackUrl: '/login'
      })
    }

    return Promise.reject(error)
  }
)

export default api
