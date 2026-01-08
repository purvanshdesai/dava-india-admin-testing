import { useMutation, useQuery } from '@tanstack/react-query'
import {
  checkTokenValidity,
  resetPassword
} from '../actions/storeAdminResetPassword'

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword
  })
}

export const useCheckTokenValidity = (token: string) => {
  return useQuery({
    queryFn: () => checkTokenValidity(token),
    queryKey: ['get-token-validity', token],
    enabled: !!token
  })
}
