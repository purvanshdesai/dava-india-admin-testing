'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  handleAddNewTax,
  handleDefaultTax,
  handleDeleteTax,
  handleEditTax,
  handleGetAllTaxes
} from '../actions/taxesActions'

export const useSubmitAddTax = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: handleAddNewTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    }
  })
}

export const useAllTaxes = (query: any) => {
  return useQuery({
    queryFn: () => handleGetAllTaxes(query),
    queryKey: ['taxes', query]
  })
}
export const usePatchTax = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: handleEditTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    }
  })
}
export const useDeleteTax = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: handleDeleteTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    }
  })
}

export const useSubmitDefaultTax = () => {
  return useMutation({
    mutationFn: handleDefaultTax
  })
}
