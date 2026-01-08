import { useMutation } from '@tanstack/react-query'
import { storeAdminForgotPassword } from '../actions/storeAdmin'

export const useStoreAdminForgotPassword = () => {
  return useMutation({
    mutationFn: storeAdminForgotPassword
  })
}
