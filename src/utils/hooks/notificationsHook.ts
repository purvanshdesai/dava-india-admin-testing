import { useMutation } from '@tanstack/react-query'
import {
  fetchNotifications,
  markAllAsRead,
  patchNotification
} from '../actions/notificationsActions'

export const useFetchNotificationMutation = () => {
  return useMutation({
    mutationFn: fetchNotifications
  })
}

export const usePatchNotification = () => {
  return useMutation({
    mutationFn: patchNotification
  })
}

export const useMarkAllAsRead = () => {
  return useMutation({
    mutationFn: markAllAsRead
  })
}
