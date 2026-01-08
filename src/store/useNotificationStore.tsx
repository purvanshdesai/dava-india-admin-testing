import { create } from 'zustand'
import { fetchNotifications } from '@/utils/actions/notificationsActions'

interface NotificationStore {
  notifications: any[]
  unreadCount: number
  currentPage: number
  hasMore: boolean
  notificationsReducer: (action: { type: string; payload: any }) => void
  fetchInitialNotifications: () => void
  loadMoreNotification: () => void
  markAllAsRead: () => void
}

const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  currentPage: 0,
  hasMore: true,
  notificationsReducer(action: any) {
    console.log('notificationsReducer')
    switch (action.type) {
      case 'SET_NOTIFICATION':
        return set(() => ({
          notifications: action.payload
        }))
      case 'ADD_NOTIFICATION':
        console.log('useNotificationStore ', action.payload)
        return set((prev: any) => ({
          notifications: [action.payload, ...prev.notifications]
        }))
      default:
        return get()
    }
  },
  fetchInitialNotifications: async () => {
    try {
      const notifications = await fetchNotifications({
        $limit: 10,
        $skip: get().currentPage
      })
      get().notificationsReducer({
        type: 'SET_NOTIFICATION',
        payload: notifications?.data
      })
      set(() => ({
        currentPage: 0
      }))
      if (notifications?.total <= get().notifications.length) {
        set({
          hasMore: true
        })
      }
    } catch (error) {
      throw error
    }
  },
  loadMoreNotification: async () => {
    try {
      const notifications = await fetchNotifications({
        $limit: 10,
        $skip: get().currentPage + 1
      })
      set((prev: any) => ({
        currentPage: prev.currentPage + 1
      }))
      set((prev: any) => ({
        notifications: [...prev.notifications, ...notifications?.data]
      }))
      if (notifications?.total <= get().notifications.length) {
        set({
          hasMore: true
        })
      }
    } catch (error) {
      throw error
    }
  },
  markAllAsRead: () => {
    set(prev => ({
      notifications: prev.notifications.map((notification: any) => ({
        ...notification,
        isRead: true
      }))
    }))
  }
}))

export default useNotificationStore
