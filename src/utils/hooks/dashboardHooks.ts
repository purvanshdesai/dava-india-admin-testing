import { useQuery } from '@tanstack/react-query'
import { fetchDashboardMetrics } from '../actions/dashboardActions'

export const useFetchDashboardMetrics = (queries: {
  month: string
  year: string
}) => {
  return useQuery({
    queryKey: ['fetchDashboardMetrics', queries],
    queryFn: () => fetchDashboardMetrics(queries)
  })
}
