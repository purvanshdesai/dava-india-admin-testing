import dayjs from 'dayjs'
import Image from 'next/image'
import React from 'react'

export default function Notification({ notification }: any) {
  return (
    <div className='flex gap-6 border-b border-[#DFE4EA] py-4'>
      {notification?.data?.image ? (
        <Image
          src={notification?.data?.image}
          width={96}
          height={96}
          className='rounded'
          alt=''
        />
      ) : null}
      <div className='w-full space-y-1'>
        <div>
          <span className='font-bold text-[#37582A]'>
            {notification?.title}:{' '}
          </span>
          {notification?.message}
        </div>

        <div className='flex justify-between'>
          <div></div>
          <div className='font-semibold text-gray-400'>
            {dayjs(notification?.createdAt).format('DD-MM-YY')}
          </div>
        </div>
      </div>
    </div>
  )
}
