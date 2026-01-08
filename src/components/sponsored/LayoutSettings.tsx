'use client'
import React from 'react'
import BannerLayout from './content/Banners'
import FeaturedLayout from './content/Featured'
import CommonLayout from './content/Common'
import { useSearchParams } from 'next/navigation'
import AppBreadcrumb from '../Breadcrumb'

export default function SponsoredLayoutSettings() {
  const searchParams = useSearchParams()

  const layoutType: string = searchParams.get('type') ?? ''
  const isBanners = ['carousel', 'carousel-mini'].includes(layoutType)
  const isFeatured = ['featured-products', 'featured-categories'].includes(
    layoutType
  )

  const isCommon = ['davaone-membership', 'generic-medicine-info'].includes(
    layoutType
  )

  return (
    <div className=''>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Sponsored', href: '/sponsored-layout' },
            {
              page: 'Layout Settings'
            }
          ]}
        />
      </div>
      <div
        className='mt-4 overflow-y-auto'
        style={{ height: 'calc(100vh - 100px)' }}
      >
        {isBanners && <BannerLayout />}
        {isFeatured && <FeaturedLayout />}
        {isCommon && <CommonLayout />}
      </div>
    </div>
  )
}
