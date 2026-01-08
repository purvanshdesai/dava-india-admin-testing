'use client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const CustomTabs = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('')

  const tabs = [
    {
      value: 'users',
      name: 'Users',
      path: '/users'
    },
    {
      value: 'roles',
      name: 'Roles',
      path: '/users/roles'
    },
    {
      value: 'invitations',
      name: 'Invitations',
      path: '/users/invitations'
    }
  ]
  useEffect(() => {
    const matchedTab = tabs.find(tab => pathname == tab.path)
    setActiveTab(matchedTab ? matchedTab.value : tabs[0].value) // Default to 'users' if no match
  }, [pathname])

  return (
    <Tabs className='w-full' value={activeTab}>
      <TabsList
        className={
          'h-11 w-full justify-start rounded-none border-b border-[#E0E0E0] bg-white p-0 dark:border-gray-600'
        }
      >
        {tabs.map((tab: any) => (
          <TabsTrigger
            disabled={tab.disabled}
            key={tab.value}
            className='mr-5 p-3 shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 data-[state=active]:shadow-none'
            value={tab.value}
            onClick={() => router.push(tab.path)}
          >
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='w-full'>
      <div>{CustomTabs()}</div>

      <div>{children}</div>
    </div>
  )
}
