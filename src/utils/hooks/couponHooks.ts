import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCoupon,
  updateCoupon,
  fetchCouponDetails,
  fetchCoupons,
  deleteCoupon
} from '@/utils/actions/couponActions'

export const useCreateCoupon = () => {
  return useMutation({
    mutationFn: createCoupon
  })
}

export const usePatchCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCoupon,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-coupons'] })
    }
  })
}

export const useFetchCouponDetails = (couponId: string) => {
  return useQuery({
    queryKey: ['fetch-coupon-details', couponId],
    queryFn: () => fetchCouponDetails(couponId)
  })
}

export const useFetchCoupons = (query: any) => {
  return useQuery({
    queryKey: ['fetch-coupons', query],
    queryFn: () => fetchCoupons(query)
  })
}

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-coupons'] })
    }
  })
}
