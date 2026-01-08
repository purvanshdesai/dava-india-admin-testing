// store/notificationStore.js
import { create } from 'zustand'

const useNotificationPopupStore = create(set => ({
  showNotification: false,
  show: () => set({ showNotification: true }),
  hide: () => set({ showNotification: false }),
  toggle: () =>
    set((state: any) => ({ showNotification: !state.showNotification }))
}))

export default useNotificationPopupStore
