'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: sessionData } = useSession() as any
  const router = useRouter()
  const pathname = usePathname()

  const routeMap: any = {
    SPONSOR_MANAGEMENT: '/sponsored-layout',
    // INVENTORY_MANAGEMENT: '/inventory',
    STORE_MANAGEMENT: '/stores',
    PRODUCT_MANAGEMENT: '/products',
    ORDER_MANAGEMENT: '/orders',
    CUSTOMER_MANAGEMENT: '/customers',
    COUPON_MANAGEMENT: '/coupons',
    CATEGORY_MANAGEMENT: '/category',
    USER_MANAGEMENT: '/users',
    ROLE_MANAGEMENT: '/users/roles',
    LANGUAGE_TRANSLATION_MANAGEMENT: '/settings/language',
    ZIP_CODE_MANAGEMENT: '/settings/zipCodes',
    DELIVERY_MANAGEMENT: '/settings/deliveryPolicy',
    TAX_MANAGEMENT: '/taxes',
    COLLECTION_MANAGEMENT: '/collections',
    POLICY_MANAGEMENT: '/settings/policies',
    MEDICINE_REQUEST_MANAGEMENT: '/settings/medicine-requests'
    // STORE_SETTINGS_MANAGEMENT: ''
  }

  useEffect(() => {
    const { role, permissions } = sessionData?.user ?? {}

    if (permissions && permissions.modules && permissions.modules.length > 0) {
      const firstModule = permissions.modules[0]

      if (firstModule.key in routeMap) {
        const redirectPath = routeMap[firstModule.key]

        if (pathname !== redirectPath) {
          router.push(redirectPath)
          return
        }
      }
    }
    const path = role === 'super-admin' ? '/stores' : '/store/orders'
    if (pathname !== path) router.push(path)
  }, [sessionData, pathname, router])
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div>Please wait while we configure your settings!</div>
    </main>
  )
}
