import api from '@/lib/axios'

export const inventoryBulkUpload = async (
  data: any,
  confirm?: boolean,
  userRole?: string
) => {
  try {
    let path = '/bulk-upload/inventory-bulk-upload'
    console.log(userRole)
    if (userRole === 'super-admin') path = '/super-admin' + path

    const res = await api.post(`${path}${confirm ? `?confirm=true` : ''}`, {
      ...data
    })
    return res.data
  } catch (error) {
    throw error
  }
}
