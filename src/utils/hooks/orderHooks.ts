import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addProductBatchNo,
  cancelAdminOrderItems,
  changeOrderDeliveryMode,
  downloadOrderInvoice,
  handleGetOrder,
  handleGetOrders,
  modifyReturn,
  reprocessCheckoutFailedOrder,
  requestToCreatePrescription,
  skipOrderLogistics
} from '../actions/orderActions'
import { handleGetStoreTransferReason } from '@/utils/actions/appDataActions'
import { getTrackOrdersStatus } from '@/utils/actions/trackOrder'

export const useGetOrders = (query: any) => {
  return useQuery({
    queryFn: () => handleGetOrders(query),
    queryKey: ['find-orders', query]
  })
}

export const useGetOrder = (orderId: string, lastRefreshedAt?: Date) => {
  return useQuery({
    queryFn: () => handleGetOrder(orderId),
    queryKey: ['get-orders', orderId, lastRefreshedAt],
    enabled: !!orderId
  })
}

export const useGetStoreTransferReasons = () => {
  return useQuery({
    queryFn: () => handleGetStoreTransferReason(),
    queryKey: ['get-store-transfer-reasons']
  })
}
export const useGetOrderTracking = (
  orderId: any,
  author: any,
  storeId: any,
  orderItemTrackingId: any
) => {
  return useQuery({
    queryFn: () =>
      getTrackOrdersStatus(orderId, author, storeId, orderItemTrackingId),
    queryKey: ['get-order-tracking', orderId, storeId, orderItemTrackingId],
    gcTime: 0
  })
}

export const useAddProductBatchNo = () => {
  return useMutation({ mutationFn: addProductBatchNo })
}
export const useReprocessCheckoutFailedOrder = () => {
  return useMutation({ mutationFn: reprocessCheckoutFailedOrder })
}

export const useDownloadOrderInvoice = (orderTrackingId: string) => {
  return useQuery({
    queryFn: () => downloadOrderInvoice(orderTrackingId),
    queryKey: ['download-order-invoice']
  })
}
export const useChangeOrderDeliveryMode = () => {
  return useMutation({ mutationFn: changeOrderDeliveryMode })
}

export const useCreateTicketForOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestToCreatePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-order-tracking'] })
    }
  })
}

export const useSkipOrderLogistics = () => {
  return useMutation({ mutationFn: skipOrderLogistics })
}

export const useAdminCancelOrderItem = () => {
  return useMutation({
    mutationFn: cancelAdminOrderItems
  })
}

export const useAdminModifyReturn = () => {
  return useMutation({
    mutationFn: modifyReturn
  })
}
