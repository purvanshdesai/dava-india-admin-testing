import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchSuperAdminUsers,
  handleDeleteSuperAdminUser,
  handleEditSuperAdminUser,
  superAdminCheckTokenValidity,
  superAdminForgotPassword,
  superAdminResetPassword
} from '../actions/superAdminActions'

export const useFetchSuperAdminUsers = (query: any) => {
  return useQuery({
    queryFn: () => fetchSuperAdminUsers(query),
    queryKey: ['fetch-super-admin-users', query]
  })
}

export const usePatchAdminUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: handleEditSuperAdminUser,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-super-admin-users'] })
    }
  })
}

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: handleDeleteSuperAdminUser,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-super-admin-users'] })
    }
  })
}

export const useSuperAdminForgotPassword = () => {
  return useMutation({
    mutationFn: superAdminForgotPassword
  })
}

export const useSuperAdminResetPassword = () => {
  return useMutation({
    mutationFn: superAdminResetPassword
  })
}

export const useSuperAdminCheckTokenValidity = (token: string) => {
  return useQuery({
    queryFn: () => superAdminCheckTokenValidity(token),
    queryKey: ['get-user-admin-token-validity', token],
    enabled: !!token
  })
}
