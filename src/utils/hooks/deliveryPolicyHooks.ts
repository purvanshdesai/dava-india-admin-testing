import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  handleCreateDeliveryPolicy,
  handleDeleteDeliveryPolicy,
  handleEditDeliveryPolicy,
  handleGetDeliveryPolices,
  handleGetDeliveryPolicy,
  handleGetDeliveryModeTemplates
} from '../actions/deliveryPolicyActions'

export const useSubmitAddDeliveryPolicy = () => {
  return useMutation({
    mutationFn: handleCreateDeliveryPolicy
  })
}

export const useGetDeliveryPolices = (query: any) => {
  return useQuery({
    queryFn: () => handleGetDeliveryPolices(query),
    queryKey: ['find-deliveryPolicy', query],
    initialData: { data: [] }
  })
}

export const useFetchDeliveryModeTemplates = () => {
  return useQuery({
    queryFn: () => handleGetDeliveryModeTemplates(),
    queryKey: ['find-delivery-mode-templates'],
    initialData: { data: [] }
  })
}

export const useGetDeliveryPolicy = (deliveryPolicyId: string) => {
  return useQuery({
    queryFn: () => handleGetDeliveryPolicy(deliveryPolicyId),
    queryKey: ['get-zipCode', deliveryPolicyId],
    enabled: !!deliveryPolicyId
  })
}

export const usePatchDeliveryPolicy = () => {
  return useMutation({
    mutationFn: handleEditDeliveryPolicy
  })
}

export const useDeleteDeliveryPolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: handleDeleteDeliveryPolicy,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['find-deliveryPolicy'] })
    }
  })
}
