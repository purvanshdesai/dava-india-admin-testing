import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Slash } from 'lucide-react'

const Breadcrumbs = () => {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  const getURL = (paths: string[], index: number) => {
    if (index === 0) return '/' + paths[index]
    return '/' + paths.slice(0, index + 1).join('/')
  }

  return (
    <div className={'p-2'}>
      <Breadcrumb>
        <BreadcrumbList>
          {paths.map((path, index) => {
            if (path === '') return null
            if (index <= paths.length - 2)
              return (
                <>
                  <BreadcrumbItem key={index}>
                    <BreadcrumbLink href={getURL(paths, index)}>
                      {path}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <Slash />
                  </BreadcrumbSeparator>
                </>
              )
            return (
              <BreadcrumbItem key={index}>
                <BreadcrumbLink>{path}</BreadcrumbLink>
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

export default Breadcrumbs
