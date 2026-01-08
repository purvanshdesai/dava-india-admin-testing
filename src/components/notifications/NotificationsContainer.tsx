'use client'
import useNotificationStore from '@/store/useNotificationStore'
import React, { useState } from 'react'
import Notification from './Notification'
import Image from 'next/image'
import { useMarkAllAsRead } from '@/utils/hooks/notificationsHook'

const notificationTypes = ['all', 'unread', 'read']

export default function NotificationContainer() {
  let { notifications } = useNotificationStore()
  const { loadMoreNotification, markAllAsRead } = useNotificationStore()
  const [notificationType, setNotificationType] = useState('all')
  const markAllAsReadMutation = useMarkAllAsRead()

  if (notificationType == 'unread') {
    notifications = notifications.filter(
      (notification: any) => !notification.isRead
    )
  }
  if (notificationType == 'read') {
    notifications = notifications.filter(
      (notification: any) => notification.isRead
    )
  }

  const handleScroll = (e: any) => {
    const element = e.target // Get the target of the scroll event
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) {
      loadMoreNotification()
    }
  }
  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
      markAllAsRead()
    } catch (error) {
      throw error
    }
  }
  return (
    <div className='rounded-2xl bg-white'>
      <h1 className='p-[30px] text-xl font-semibold'>Notification</h1>
      <div className='px-8'>
        <div className='flex justify-between'>
          <div className='flex gap-7'>
            {notificationTypes.map(type => (
              <div
                key={type}
                onClick={() => setNotificationType(type)}
                className={`cursor-pointer font-medium capitalize ${notificationType == type ? 'border-b-2 border-primary text-primary' : 'text-[#697386]'}`}
              >
                {type}
              </div>
            ))}
          </div>
          <div
            className='cursor-pointer font-semibold text-primary'
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </div>
        </div>
        <div className='border border-[#DFE4EA]'></div>
        <div className='max-h-[65vh] overflow-auto' onScroll={handleScroll}>
          {notifications.map((notification: any) => (
            <Notification key={notification?._id} notification={notification} />
          ))}
          {!notifications.length ? (
            <div className='flex flex-col items-center py-9'>
              <Image
                src={'/images/no_notification.svg'}
                width={200}
                height={200}
                alt=''
              />
              <h1>No Notifications Found</h1>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
