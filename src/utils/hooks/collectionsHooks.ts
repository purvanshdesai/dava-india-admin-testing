import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCollection,
  fetchCollections,
  handleGetAllCollections,
  updateCollection,
  handleGetCollection,
  deleteCollection
} from '../actions/collectionActions'

export const useFetchCollections = (query: any) => {
  return useQuery({
    queryKey: ['fetch-collections', query],
    queryFn: () => fetchCollections(query)
  })
}

export const useCreateCollection = () => {
  return useMutation({
    mutationFn: createCollection
  })
}

export const useGetCOllection = (collectionId: string) => {
  return useQuery({
    queryFn: () => handleGetCollection(collectionId),
    queryKey: ['get-collection', collectionId]
  })
}

export const usePatchCollection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCollection,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-collections'] })
    }
  })
}

export const useGetAllCollections = () => {
  return useQuery({
    queryFn: () => handleGetAllCollections(),
    queryKey: ['get-all-categories']
  })
}

export const useDeleteCollection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-collections'] })
    }
  })
}
