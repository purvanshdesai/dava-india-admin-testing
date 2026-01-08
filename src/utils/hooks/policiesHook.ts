import { useQuery } from '@tanstack/react-query'
import { fetchPolicies } from '../actions/policiesAction'

export const useFetchPolicies = () => {
  return useQuery({
    queryKey: ['fetch-policies'],
    queryFn: () => fetchPolicies()
  })
}
