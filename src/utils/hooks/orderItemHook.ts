import { useMutation } from '@tanstack/react-query'
import { updateOrderItemBatchNo } from '../actions/orderItemActions'

export const useUpdateOrderItemBatchNo = () => {
  return useMutation({
    mutationFn: updateOrderItemBatchNo
  })
}
