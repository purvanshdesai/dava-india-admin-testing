import api from '@/lib/axios'

export async function updateOrderItemBatchNo({
  ...rest
}: {
  role: string
  orderItemId: string
  batchNo: string
}) {
  try {
    const URL = 'super-admin/order-items'

    const axiosRes = await api.post(URL, rest)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
