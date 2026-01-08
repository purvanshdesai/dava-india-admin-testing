'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchStoresPost,
  handleAddNewStore,
  handleChangeStoreActive,
  handleDeleteStore,
  handleEditStore,
  handleGetStore,
  handleGetStores,
  resendInvitationMail,
  TStoresQuery
} from '../actions/storeActions'

export const useSubmitAddStore = () => {
  return useMutation({
    mutationFn: handleAddNewStore
  })
}

export const usePatchStore = () => {
  return useMutation({
    mutationFn: handleEditStore
  })
}

export const useDeleteStore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: handleDeleteStore,
    onSuccess: () => {
      //   queryClient.setQueryData(['find-stores'], (oldData: Store[]) => {
      //     console.log('oldDaat ', oldData)
      //     return oldData.filter(data => data._id !== deletedData._id)
      //   })
      queryClient.invalidateQueries({ queryKey: ['find-stores'] })
    }
  })
}

export const useGetStores = (query: TStoresQuery) => {
  return useQuery({
    queryFn: () => handleGetStores(query),
    queryKey: ['find-stores', { ...query }],
    initialData: { data: [] }
  })
}

export const useFetchStoresPost = (query: any) => {
  return useQuery({
    queryFn: () => fetchStoresPost(query),
    queryKey: ['find-stores-post', { ...query }],
    initialData: { data: [] }
  })
}

export const useGetStore = (storeId: string) => {
  return useQuery({
    queryFn: () => handleGetStore(storeId),
    queryKey: ['get-stores', storeId],
    enabled: !!storeId
  })
}

export const useChangeActiveStatus = () => {
  return useMutation({
    mutationFn: handleChangeStoreActive
  })
}

export const useStoreResendInvite = () => {
  return useMutation({
    mutationFn: resendInvitationMail
  })
}
