'use client'

import useNotificationPopupStore from '@/store/notificationPopupStore'
import SocketNotificationListener from '@/utils/SocketNotificationListener'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import Image from 'next/image'
// import { useRouter } from 'next/navigation'

export default function StartUp() {
  const session = useSession() as any
  // const router = useRouter()
  const isLoggedIn = session.status === 'authenticated'
  const { toggle, showNotification } = useNotificationPopupStore() as any

  useEffect(() => {
    if (isLoggedIn) {
      SocketNotificationListener.initialize()
      SocketNotificationListener.fetchNotifications()
    }
  }, [isLoggedIn])

  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     router.push('/login') // avoid going back to expired page
  //   }
  // }, [isLoggedIn])

  useEffect(() => {
    playSilentAudio()
  }, [])

  const playSilentAudio = () => {
    const audio = new Audio()
    audio.src =
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=' // Silent audio
    audio.play()
  }

  return (
    <>
      <Dialog open={showNotification}>
        <DialogContent>
          <DialogTitle>New Notification</DialogTitle>
          <Image
            className='mx-auto'
            src={'/images/NewOrder.svg'}
            alt={'dia'}
            height={100}
            width={328}
          />
          <div className='flex flex-col items-center gap-4'>
            <p>New online order received.</p>
            <Button
              className='flex w-20 items-center justify-center'
              onClick={() => toggle(false)}
            >
              Accept
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
