import useNotificationStore from '@/store/useNotificationStore'
import { getSession } from 'next-auth/react'
import { io } from 'socket.io-client'
import { playNotificationSound } from '@/lib/notificationAlert'
import useNotificationPopupStore from '@/store/notificationPopupStore'

class SocketNotificationListener {
  socket: any
  fetchPageCallback: () => number
  setNotificationsCallback: (notifications: any) => void
  isInitialized: boolean
  namespace: string

  constructor({
    namespace = 'adminNotifications',
    fetchPageCallback,
    setNotificationsCallback
  }: any) {
    this.socket = null
    this.namespace = namespace
    this.fetchPageCallback = fetchPageCallback // Callback to get the current page from Redux
    this.setNotificationsCallback = setNotificationsCallback // Callback to set all notifications together
    this.isInitialized = false
  }

  async initSocket() {
    const session = await getSession()
    console.log('session 1', session)
    if (session?.accessToken) {
      const socket = io(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/${this.namespace}`,
        {
          transports: ['websocket'],
          query: {
            token: session.accessToken
          }
        }
      )
      this.socket = socket
    } else {
      throw new Error('User not auth')
    }
  }

  isSocketReady(): boolean {
    return this.socket !== null && this.socket.connected
  }

  async initialize() {
    try {
      if (this.isInitialized) return
      const session = await getSession()

      if (session?.accessToken) {
        const socketUrl =
          process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3030'
        const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || '/socket.io'

        const socket = io(`${socketUrl}/adminNotifications`, {
          path: socketPath,
          transports: ['websocket', 'polling'],
          auth: {
            token: session.accessToken,
            role: 'super-admin'
          },
          forceNew: true,
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        })
        this.socket = socket
        this.isInitialized = true

        this.socket.on('connect', () => {
          console.log('Socket connected to adminNotifications')
        })

        this.socket.on('disconnect', (reason: any) => {
          console.log('Socket disconnected:', reason)
        })

        this.socket.on('connect_error', (error: any) => {
          console.log('Socket connection error:', error.message)

          // Handle authentication errors specifically
          if (error.message?.includes('Authentication failed')) {
            console.log('Authentication failed - user may need to re-login')
          }
        })

        this.socket.on('new_notification', async (notification: any) => {
          this.handleNewNotification(notification)
          if (notification.title == 'Order Placed') {
            const store: any = useNotificationPopupStore.getState()
            store.toggle(true)
          }
          await playNotificationSound()
        })

        // Handle socket connection errors
        this.socket.on('error', (error: any) => {
          console.log('Socket error:', error)
        })
      } else {
        throw new Error('User not auth')
      }
    } catch (error) {
      console.log(error)
    }
  }

  disconnect() {
    if (this.isInitialized) {
      this.socket.disconnect()
      this.isInitialized = false
    }
  }

  async fetchNotifications() {
    try {
      useNotificationStore.getState().fetchInitialNotifications()
    } catch (error) {
      console.log('Error fetching notifications:', error)
    }
  }

  handleNewNotification(notification: any) {
    // Use the callback to handle the new notification
    if (this.setNotificationsCallback) {
      this.setNotificationsCallback(notification)
    }
  }
}

export default new SocketNotificationListener({
  namespace: 'adminNotifications',
  setNotificationsCallback: (notification: any) => {
    console.log('setNotificationsCallback c')
    const setNotification = useNotificationStore.getState().notificationsReducer
    setNotification({
      type: 'ADD_NOTIFICATION',
      payload: notification
    })
  }
})
