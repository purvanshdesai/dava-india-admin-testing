import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AcceptOrRejectInvitation,
  CreateInvitation,
  deleteUserInvitation,
  ValidateInvitation
} from '../actions/userInvitationActions'
import { fetchUserInvitations } from '../actions/userInvitationActions'

export const useCreateUserInvitation = () => {
  return useMutation({
    mutationFn: CreateInvitation
  })
}

export const useValidateInvitation = () => {
  return useMutation({
    mutationFn: ValidateInvitation
  })
}

export const usePatchInvitation = () => {
  return useMutation({
    mutationFn: AcceptOrRejectInvitation
  })
}

export const useFetchSuperAdminUsersInvitations = (query: any) => {
  return useQuery({
    queryFn: () => fetchUserInvitations(query),
    queryKey: ['fetch-super-admin-users', query]
  })
}
export const useDeleteInvitation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUserInvitation,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['fetch-super-admin-users']
      })
    }
  })
}
