import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addCouriersToLogisticsRule,
  addDeliveryZonesToLogisticsRule,
  addNewLogisticsRule,
  deleteLogisticsRule,
  deleteLogisticsRuleCourier,
  deleteLogisticsRuleDeliveryZone,
  fetchAllCourierPartners,
  fetchLogisticsRuleById,
  fetchLogisticsRuleCouriers,
  fetchLogisticsRuleDeliveryZones,
  fetchLogisticsRules
} from '@/utils/actions/logisticsActions'

export function useFetchLogisticsRules(query: {
  skip: number
  limit: number
  filters?: { id: string; value: string }[]
}) {
  return useQuery({
    queryKey: ['fetch-logistics-rules', query],
    queryFn: () => fetchLogisticsRules(query),
    gcTime: 0
  })
}

export function useFetchLogisticsRuleById(ruleId: string) {
  return useQuery({
    queryKey: ['fetch-logistics-rules', ruleId],
    queryFn: () => fetchLogisticsRuleById(ruleId),
    gcTime: 0
  })
}

export function useFetchLogisticsRuleDeliveryZones(query: {
  ruleId: string
  skip: number
  limit: number
  filters?: { id: string; value: string }[]
}) {
  return useQuery({
    queryKey: ['fetch-logistics-rule-delivery-zones', query],
    queryFn: () => fetchLogisticsRuleDeliveryZones(query),
    gcTime: 0
  })
}

export function useFetchLogisticsRuleCouriers(query: {
  ruleId: string
  skip: number
  limit: number
  filters?: { id: string; value: string }[]
}) {
  return useQuery({
    queryKey: ['fetch-logistics-rule-couriers', query],
    queryFn: () => fetchLogisticsRuleCouriers(query),
    gcTime: 0
  })
}

export function useDeleteLogisticsRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLogisticsRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetch-logistics-rules'] })
    }
  })
}

export function useDeleteLogisticsRuleDeliveryZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLogisticsRuleDeliveryZone,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fetch-logistics-rule-delivery-zones']
      })
    }
  })
}

export function useDeleteLogisticsRuleCourier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLogisticsRuleCourier,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fetch-logistics-rule-couriers']
      })
    }
  })
}

export function useAddDeliveryZonesToLogisticsRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addDeliveryZonesToLogisticsRule,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fetch-logistics-rule-delivery-zones']
      })
    }
  })
}

export function useFetchCourierPartners(query: any) {
  return useQuery({
    queryKey: ['fetch-courier-partners', query],
    queryFn: () => fetchAllCourierPartners(query),
    gcTime: 0
  })
}

export function useAddCouriersToLogisticsRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addCouriersToLogisticsRule,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fetch-logistics-rule-couriers']
      })
    }
  })
}

export function useAddNewLogisticsRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addNewLogisticsRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetch-logistics-rules'] })
    }
  })
}
