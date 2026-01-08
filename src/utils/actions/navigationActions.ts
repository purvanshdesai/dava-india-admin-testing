import api from '@/lib/axios'

export async function createNavigation(formData: any) {
  try {
    const axiosRes = await api.post('/navigations', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const handleGetAllNavigation = async () => {
  try {
    const res = await api.get('/navigations')

    return res.data
  } catch (error) {
    throw error
  }
}

export async function deleteNavigation(navigationId: string) {
  try {
    const axiosRes = await api.delete(`/navigations/${navigationId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function reorderNavigationLayouts(data: any) {
  try {
    const axiosRes = await api.post('/navigations/layout-positioning', data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
