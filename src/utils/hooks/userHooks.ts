import { useMutation, useQuery } from '@tanstack/react-query'
import {
  creditDavaCoinsToUser,
  fetchUserById,
  fetchUsers,
  TUsersQuery
} from '../actions/userActions'
import { getSession } from '@/lib/getSession'

export const useFetchUsers = (query: TUsersQuery) => {
  return useQuery({
    queryFn: () => fetchUsers(query),
    queryKey: ['find-users', { ...query }],
    initialData: { data: [] }
  })
}

export const useFetchUserSession = () => {
  return useQuery({
    queryKey: ['fetch-user-session'],
    queryFn: () => getSession()
  })
}

export const useFetchUserById = (id: string) => {
  return useQuery({
    queryFn: () => fetchUserById(id),
    queryKey: ['fetch-user', id],
    enabled: !!id
  })
}

export const useCreditDavaCoinsToUser = () => {
  return useMutation({
    mutationFn: creditDavaCoinsToUser
  })
}
