import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createNavigation,
  handleGetAllNavigation
} from '../actions/navigationActions'

export const useCreateNavigation = () => {
  return useMutation({
    mutationFn: createNavigation
  })
}

export const useFetchNavigation = ({
  lastRefreshed
}: {
  lastRefreshed: Date
}) => {
  return useQuery({
    queryKey: ['fetch-navigation', lastRefreshed],
    queryFn: () => handleGetAllNavigation()
  })
}
