import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRole,
  deleteRole,
  fetchModules,
  fetchRoleById,
  fetchRoles,
  updateRole
} from '../actions/rolesActions'

export const useCreateCoupon = () => {
  return useMutation({
    mutationFn: createRole
  })
}

export const useFetchModules = () => {
  return useQuery({
    queryKey: ['fetch-modules'],
    queryFn: fetchModules
  })
}

// export const useFetchRoles = (query: any) => {
//   return useQuery({
//     queryKey: ['fetch-roles'],
//     queryFn: fetchRoles
//   })
// }

export const useFetchRoles = (query?: any) => {
  return useQuery({
    queryFn: () => fetchRoles(query),
    queryKey: ['fetch-roles', query]
  })
}

export const useFetchRoleById = (roleId: string) => {
  return useQuery({
    queryKey: ['fetch-role-by-id', roleId],
    queryFn: () => fetchRoleById(roleId)
  })
}

export const usePatchRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRole,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-roles'] })
    }
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRole,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['fetch-roles'] })
    }
  })
}
