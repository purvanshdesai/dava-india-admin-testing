import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  handleAddNewCategory,
  handleDeleteCategory,
  handleEditCategory,
  handleGetCategories,
  handleGetCategory,
  TCategoryQuery,
  handleGetAllCategories
} from '../actions/categoryActions'

export const useGetAllCategory = (type: string) => {
  return useQuery({
    queryKey: ['find-type-category', type],
    queryFn: () => handleGetAllCategories(type)
  })
}

export const useSubmitAddCategory = () => {
  return useMutation({
    mutationFn: handleAddNewCategory
  })
}

export const usePatchCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: handleEditCategory,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['find-category'] })
    }
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: handleDeleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['find-category'] })
    }
  })
}

export const useGetCategories = (query: TCategoryQuery) => {
  return useQuery({
    queryFn: () => handleGetCategories(query),
    queryKey: ['find-category', query]
  })
}

export const useGetCategory = (categoryId: string) => {
  return useQuery({
    queryFn: () => handleGetCategory(categoryId),
    queryKey: ['get-category', categoryId]
  })
}

export const useGetAllCategories = (type: any) => {
  return useQuery({
    queryFn: () => handleGetAllCategories(type),
    queryKey: ['get-all-categories', type]
  })
}
