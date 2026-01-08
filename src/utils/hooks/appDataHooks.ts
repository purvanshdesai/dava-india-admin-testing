import { useQuery } from '@tanstack/react-query'

import {
  handleGetAllConsumptions,
  handleGetAllLanguages
} from '../actions/appDataActions'

export const useGetSupportedLanguages = (query: any) => {
  return useQuery({
    queryFn: () => handleGetAllLanguages(),
    queryKey: ['find-language', query]
  })
}
export const useGetConsumptions = (query: any) => {
  return useQuery({
    queryFn: () => handleGetAllConsumptions(),
    queryKey: ['find-consumptions', query]
  })
}
