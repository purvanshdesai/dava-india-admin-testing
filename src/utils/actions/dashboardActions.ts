import api from '@/lib/axios'

export async function fetchDashboardMetrics(queries: {
  month: string
  year: string
}) {
  try {
    const axiosRes = await api.get(
      `/dashboard?year=${queries.year}&month=${queries.month}`
    )

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}
