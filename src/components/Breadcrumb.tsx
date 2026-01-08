import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useRouter } from 'next/navigation'

export default function AppBreadcrumb({
  locations = []
}: {
  locations: { page: string; href?: string; onClickPath?: () => void }[]
}) {
  const router = useRouter()
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {locations.map((location, index) => {
            return (
              <div key={index} className='flex items-center gap-2'>
                {index > 0 && (
                  <BreadcrumbSeparator>{/* <Slash /> */}</BreadcrumbSeparator>
                )}
                <BreadcrumbItem key={index}>
                  {index !== locations.length - 1 && location.href ? (
                    <BreadcrumbLink
                      onClick={() => {
                        router.push(location.href as string)
                        if (location?.onClickPath) location.onClickPath()
                      }}
                      className='cursor-pointer font-semibold text-primary'
                    >
                      {location?.page}
                    </BreadcrumbLink>
                  ) : (
                    location.page
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
