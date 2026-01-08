import { useMutation, useQuery } from '@tanstack/react-query'
import { getSettings, updateSettings } from '@/utils/actions/settingsActions'

export const useUpdateSettings = () => {
  return useMutation({
    mutationFn: updateSettings
  })
}

export const useFetchSettings = () => {
  return useQuery({
    queryKey: ['get-settings'],
    queryFn: getSettings
  })
}
