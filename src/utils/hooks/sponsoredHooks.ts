import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteSponsor,
  fetchSponsorDetails,
  updateSponsorDetails
} from '../actions/sponsoredSettingActions'

import { fetchSponsoredLayouts } from '../actions/sponsoredActions'

export const useFetchSponsors = (query: any) => {
  return useQuery({
    queryKey: ['fetch-sponsors', query],
    queryFn: () => fetchSponsorDetails(query)
  })
}

export const useFetchSponsoredLayouts = (query: any) => {
  return useQuery({
    queryKey: ['fetch-sponsors', query],
    queryFn: () => fetchSponsoredLayouts(query)
  })
}

export const useDeleteSponsor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetch-sponsors'] })
    }
  })
}

export const usePatchSponsor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSponsorDetails,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-sponsors'] })
    }
  })
}
