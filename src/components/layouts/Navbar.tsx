'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Store,
  PackageOpen,
  LayoutGrid,
  // Blend,
  TicketPercent,
  SlidersHorizontal,
  LogOutIcon,
  Package,
  UserRoundPen,
  DollarSign,
  Megaphone,
  EllipsisVertical,
  Bell,
  BetweenHorizontalStart,
  FileText,
  Forklift,
  BellDot,
  WarehouseIcon,
  LayoutDashboard,
  MoreHorizontalIcon,
  UsersIcon
} from 'lucide-react'
import { handleSignOut } from '@/utils/actions/authActions'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@radix-ui/react-popover'
import { ThemeSwitcher } from '../utils/theme-switcher'

interface Page {
  page: string
  path: string
  icon: any
  permissionKey: string | null
}

const menuItems: Array<Page> = [
  {
    page: 'Dashboard',
    path: '/dashboard',
    permissionKey: null,
    icon: LayoutDashboard
  },
  {
    page: 'Stores',
    path: '/stores',
    permissionKey: 'STORE_MANAGEMENT',
    icon: Store
  },
  {
    page: 'Orders',
    path: '/orders',
    permissionKey: 'ORDER_MANAGEMENT',
    icon: PackageOpen
  },
  {
    page: 'Inquiries',
    path: '/inquiries',
    permissionKey: 'TICKET_MANAGEMENT',
    icon: FileText
  },
  {
    page: 'Products',
    path: '/products',
    permissionKey: 'PRODUCT_MANAGEMENT',
    icon: LayoutGrid
  },
  {
    page: 'Collections',
    path: '/collections',
    permissionKey: 'COLLECTION_MANAGEMENT',
    icon: BetweenHorizontalStart
  },
  {
    page: 'Coupons',
    path: '/coupons',
    permissionKey: 'COUPON_MANAGEMENT',
    icon: TicketPercent
  },
  {
    page: 'Admin Users',
    path: '/users',
    permissionKey: 'USER_MANAGEMENT',
    icon: UserRoundPen
  },
  {
    page: 'Customers',
    path: '/customers',
    permissionKey: 'CUSTOMER_MANAGEMENT',
    icon: UsersIcon
  },
  {
    page: 'Sponsor Settings',
    path: '/sponsored-layout',
    permissionKey: 'SPONSOR_MANAGEMENT',
    icon: Megaphone
  },
  {
    page: 'Taxes',
    path: '/taxes',
    permissionKey: 'TAX_MANAGEMENT',
    icon: DollarSign
  },
  {
    page: 'Logistics',
    path: '/logistics',
    permissionKey: 'LOGISTICS_MANAGEMENT',
    icon: Forklift
  },
  {
    page: 'Notifications',
    path: '/notifications',
    permissionKey: null,
    icon: BellDot
  },
  {
    page: 'Inventory',
    path: '/inventory',
    permissionKey: 'INVENTORY_MANAGEMENT',
    icon: WarehouseIcon
  },
  {
    page: 'More',
    path: '/settings',
    permissionKey: 'SETTINGS_MANAGEMENT',
    icon: MoreHorizontalIcon
  }
]

const storeAdminMenuItems = [
  { page: 'Orders', path: '/store/orders', icon: PackageOpen },
  { page: 'Inventory', path: '/store/inventory', icon: Package },
  { page: 'Settings', path: '/store/store-settings', icon: SlidersHorizontal },
  {
    page: 'Notifications',
    path: '/store/notifications',
    icon: Bell
  }
]

export default function Navbar({ isMini }: { isMini: boolean }) {
  const router: any = useRouter()
  const pathname = usePathname()
  const [pages, setPages] = useState<any[]>([])
  const { data: session, status: sessionStatus }: any = useSession()

  const onNavigatePage = (page: Page) => {
    router.push(page.path)
  }

  const handleSuperAdminNavigation = () => {
    const { fullAccess, modules = [] } = session?.user?.permissions

    const modulesHavePermissionKeys = modules?.map((p: any) => p.key)

    if (fullAccess) {
      setPages(menuItems)
    } else {
      const enabledNavigation = menuItems.filter((m: Page) => {
        if (!m.permissionKey) return true

        if (m.permissionKey === 'SETTINGS_MANAGEMENT') {
          return modulesHavePermissionKeys.find((p: any) =>
            [
              'ZIP_CODE_MANAGEMENT',
              'DELIVERY_MANAGEMENT',
              'GENERAL_SETTING_MANAGEMENT',
              'NAVIGATION_MANAGEMENT'
            ].includes(p)
          )
        }

        return modulesHavePermissionKeys.includes(m.permissionKey)
      })

      setPages(enabledNavigation)
    }
  }

  useEffect(() => {
    if (session?.user?.role) {
      if (session?.user?.role == 'super-admin') {
        handleSuperAdminNavigation()
      } else if (session?.user?.role == 'store-admin') {
        setPages(storeAdminMenuItems)
      }
    }
  }, [session, sessionStatus])

  return (
    <div className='relative h-full border-r border-gray-200'>
      <div className='relative p-3'>
        <Image
          src='/images/Logo.svg'
          width={180}
          height={100}
          alt={'Logo Image'}
          priority={true}
        />
        {/*
        <div className='absolute -right-3 top-4 rounded-full bg-white p-1 dark:bg-gray-600'>
          <ChevronRight
            size={24}
            className={`transform cursor-pointer ${isMini ? '' : 'rotate-180'}`}
            onClick={() => setMiniStatus(!isMini)}
          />
        </div> */}
      </div>
      {session?.user?.role == 'store-admin' ? (
        <div>
          <div
            className={
              'm-2 flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold'
            }
          >
            <Image
              src={'/images/store-logo.svg'}
              alt={'Logo'}
              width={28}
              height={28}
            />{' '}
            <div className={'flex grow justify-center'}>
              {session?.user.stores[0].storeName}
            </div>
          </div>
          <hr className='mx-2 mt-3 border-gray-300 dark:border-white' />
        </div>
      ) : null}

      <div
        className='overflow-y-auto pt-3'
        style={{ height: 'calc(100vh - 124px)' }}
      >
        <div className={`${isMini ? 'flex flex-col items-center' : ''}`}>
          {pages.map((page: Page) => {
            const Icon = page.icon
            const isCurrent = pathname.includes(page.path)
            return (
              <div
                key={page.path}
                onClick={() => onNavigatePage(page)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-primary-dim dark:hover:bg-gray-600 ${isCurrent ? 'bg-primary-dim dark:bg-gray-600' : ''}`}
              >
                <Icon
                  size={20}
                  className={
                    isCurrent
                      ? 'text-primary'
                      : 'text-label dark:text-slate-100'
                  }
                />

                {!isMini && (
                  <span
                    className={`${isCurrent ? 'font-bold text-primary' : 'font-semibold text-gray-700 dark:text-gray-300'} text-sm`}
                  >
                    {page.page}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className='absolute inset-x-0 bottom-0 flex h-[55px] items-center justify-between border-t border-gray-200 pl-2'>
        <div>
          <div className='flex items-center gap-2'>
            <Avatar>
              <AvatarImage src={'/images/Profile.svg'} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div className={'flex flex-col'}>
              <p className='max-w-40 truncate text-sm font-semibold'>
                {sessionStatus && session?.user?.name}
              </p>
              <p className={'text-xs font-semibold text-label'}>
                {sessionStatus && session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        <div>
          {/*<LogOutIcon*/}
          {/*  className='cursor-pointer text-red-600'*/}
          {/*  onClick={async () => await handleSignOut(session?.user?.role)}*/}
          {/*/>*/}
          <Popover>
            <PopoverTrigger className='dark:border-gray-900' asChild>
              <EllipsisVertical className={'cursor-pointer'} size={18} />
            </PopoverTrigger>
            <PopoverContent
              sideOffset={10}
              side={'top'}
              align={'end'}
              className='ml-3 w-48 space-y-2 rounded-lg bg-white p-1 px-3 drop-shadow-md dark:bg-gray-800'
            >
              <div className='flex items-center'>
                <ThemeSwitcher className={'p-2'} />
                <div className='px-2 text-xs dark:text-gray-300'>
                  Theme Mode
                </div>
              </div>
              <div
                className='flex cursor-pointer items-center p-2'
                onClick={async () => await handleSignOut(session?.user?.role)}
              >
                <LogOutIcon className='mr-2 text-red-600' size={18} />
                <div className='px-2 text-xs dark:text-gray-300'>Log Out</div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
