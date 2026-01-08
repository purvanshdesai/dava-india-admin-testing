import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchZipCodes,
  fetchZipCodesPost,
  handleAddNewZipCode,
  handleBulkUploadZipCodes,
  handleDeleteZipCode,
  handleEditZipCode,
  handleGetCityStateZipCode,
  handleGetZipCode,
  handleGetZipCodes
} from '../actions/zipCodeActions'

export const useSubmitAddZipCode = () => {
  return useMutation({
    mutationFn: handleAddNewZipCode
  })
}

export const useGetZipCodes = (query: any) => {
  return useQuery({
    queryFn: () => handleGetZipCodes(query),
    queryKey: ['find-zipCode', query],
    initialData: { data: [] }
  })
}
export const useFetchZipCodesPost = (query: any) => {
  return useQuery({
    queryFn: () => fetchZipCodesPost(query),
    queryKey: ['find-zipCode-post', query],
    initialData: { data: [] }
  })
}
export const useFetchZipCodes = (query: any) => {
  return useQuery({
    queryFn: () => fetchZipCodes(query),
    queryKey: ['find-zipCode', query],
    initialData: { data: [] }
  })
}
// fetchZipCodes
export const useGetZipCode = (zipCodeId: string) => {
  return useQuery({
    queryFn: () => handleGetZipCode(zipCodeId),
    queryKey: ['get-zipCode', zipCodeId],
    enabled: !!zipCodeId
  })
}

export const usePatchZipCode = () => {
  return useMutation({
    mutationFn: handleEditZipCode
  })
}

export const useDeleteZipCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: handleDeleteZipCode,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['find-zipCode'] })
    }
  })
}

export const useGetZipDataFromZipCode = (zipCode: string) => {
  return useQuery({
    queryFn: () => handleGetCityStateZipCode(zipCode),
    queryKey: ['get-zipCode-Info', zipCode],
    enabled: zipCode?.length >= 6
  })
}

export const useBulkUploadZipCodes = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: handleBulkUploadZipCodes,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['find-zipCode'] })
    }
  })
}
