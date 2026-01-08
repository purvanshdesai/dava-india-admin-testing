'use client'

import React from 'react'
import Navbar from './Navbar'
import { useFooter } from '@/context/Footer'

interface RootLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: RootLayoutProps) {
  const { footerContent } = useFooter() as any

  const mini = false

  return (
    <div className='h-screen w-full bg-primary-light-blue dark:bg-gray-900'>
      <div
        className={`absolute h-screen shadow-sm duration-300 ${
          mini ? 'w-16' : 'w-64'
        }`}
      >
        <Navbar isMini={mini} />
      </div>
      <div className={`h-screen duration-300 ${mini ? 'ml-16' : 'ml-64'}`}>
        <div
          style={{
            height: footerContent ? 'calc(100vh - 55px)' : '100vh'
          }}
          className='overflow-y-auto bg-white px-6 pt-6 dark:bg-gray-800 md:px-8 md:pt-6'
        >
          {children}
        </div>
        {footerContent}
      </div>
    </div>
  )
}
