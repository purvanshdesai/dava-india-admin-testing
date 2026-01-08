'use client'
import { productColumns } from '@/components/products/columns'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useFetchProducts } from '@/utils/hooks/productHooks'
import React, { useEffect, useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useRouter, useSearchParams } from 'next/navigation'
import FormDialog from '@/components/form/FormDialogBox'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useExportData } from '@/utils/hooks/exportHooks'
import { downloadFileFromURL } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import moment from 'moment-timezone'
import Image from 'next/image'
import { useDebounce } from '@/utils/hooks/debounce'
import { useFetchCollections } from '@/utils/hooks/collectionsHooks'
import { useGetConsumptions } from '@/utils/hooks/appDataHooks'

const statusFilter: any = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' }
]

export default function ProductsList() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })

  const debounceFilter = useDebounce(columnFilters, 1000)
  const { data: products, isLoading } = useFetchProducts({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: debounceFilter
  })

  const { data: collections } = useFetchCollections({
    $limit: 1000,
    $skip: 0,
    filters: [{ id: 'type', value: 'subCategory' }]
  }) as any

  const { data: consumptions }: any = useGetConsumptions({})

  const [data, setData] = useState([])
  const [isDownloading, setDownloadStatus] = useState(false)
  const { mutateAsync: exportData } = useExportData()

  const useProductPermissions = () => {
    const canReadProducts = hasPermission(
      MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
      MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.READ_PRODUCT
    )
    const canCreateProducts = hasPermission(
      MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
      MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.CREATE_PRODUCT
    )
    const canDownloadProducts = hasPermission(
      MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
      MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.DOWNLOAD_PRODUCT
    )

    return { canReadProducts, canCreateProducts, canDownloadProducts }
  }

  const perms = useProductPermissions()

  

  const router = useRouter()
  useEffect(() => {
    if (products?.data) {
      setData(products?.data)
    }
  }, [products?.data])

  const handleDownloadProducts = async () => {
    try {
      setDownloadStatus(true)
      const buildExportFilters = (filters: ColumnFiltersState) => {
        const f: any = {}
        for (const filter of filters) {
          const { id, value } = filter as any
          if (id === 'title' && typeof value === 'string') {
            f.title = value
          }
          if (id === 'isActive') {
            if (Array.isArray(value)) {
              if (value.length === 1) f.isActive = !!value[0]
            } else if (typeof value !== 'undefined') {
              f.isActive = !!value
            }
          }
          if (id === 'collections') {
            f.collections = Array.isArray(value) ? value : [value]
          }
          if (id === 'saltType') {
            if (Array.isArray(value)) {
              if (value.length === 1) f.saltType = value[0]
              else f.$or = [
                ...(f.$or ?? []),
                ...value.map((v: any) => ({ saltType: v }))
              ]
            } else if (typeof value !== 'undefined') {
              f.saltType = value
            }
          }
          if (id === 'consumption') {
            f.consumption = Array.isArray(value) ? value : [value]
          }
        }
        return f
      }

      const res = await exportData({
        exportFor: 'products',
        filters: buildExportFilters(columnFilters)
      })

      if (!res?.filePath) {
        toast({
          title: 'Download Error',
          description: 'There was an error downloading the products list'
        })
        return
      }

      await downloadFileFromURL(
        res.filePath,
        `Davaindia-products-report-${moment().format('DD-MM-YYYY')}.xlsx`
      )
    } catch (e) {
      console.log(e)
      toast({
        title: 'Download Error',
        description: 'There was an error downloading the products list',
        variant: 'destructive'
      })
    } finally {
      setDownloadStatus(false)
    }
  }

  return (
    <>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 text-xl font-semibold'>
              Products
              {perms.canReadProducts && (
                <span className='text-sm text-label'>
                  ({products?.total ?? 0})
                </span>
              )}
            </h2>
          </div>

          <div className='flex items-center gap-4'>

            {perms.canCreateProducts ? (
              <FormDialog
                footerNotReq={true}
                content={
                  <div className={'flex flex-col items-center'}>
                    <Image
                      src={'/images/dialog-question.svg'}
                      alt={'Question'}
                      height={150}
                      width={150}
                    />
                    <div className={'my-5'}>
                      Do you want add variations for the product?
                    </div>
                    <div className='flex w-full flex-row items-center justify-center space-x-4'>
                      <Button
                        className='flex w-1/2 items-center rounded-lg text-sm text-primary'
                        variant={'outline'}
                        onClick={() => {
                          router.push(
                            `/products/new?page=${page || pagination.pageIndex}&limit=${limit || pagination.pageSize}`
                          )
                        }}
                      >
                        No
                      </Button>
                      <Button
                        className='flex w-1/2 items-center rounded-lg text-sm'
                        onClick={() => {
                          router.push(
                            `/products/variations/new?page=${page || pagination.pageIndex}&limit=${limit || pagination.pageSize}`
                          )
                        }}
                      >
                        Yes
                      </Button>
                    </div>
                  </div>
                }
                trigger={
                  <Button size={'sm'} className='flex items-center gap-2'>
                    <Plus />
                    Add New
                  </Button>
                }
                footerActions={null}
              />
            ) : null}
          </div>
        </div>
        <div className='pb-8'>
          {perms.canReadProducts ? (
            <DataTable
              data={data}
              dataState={[data, setData]}
              columns={productColumns}
              page='products'
             filters={{
               collections: (collections?.data ?? []).map((c: any) => ({
                 value: c._id,
                 label: c.name
               })),
               consumptions: (consumptions ?? []).map((c: any) => ({
                 value: c._id,
                 label: c.label
               })),
               statusFilter,
               saltTypeFilter: ['Single Salt', 'Multi Sale', 'None'].map(
                 (s: any) => ({ value: s, label: s })
               ),
               search: {
                 by: 'title',
                 placeholder: 'Search products ...'
               }
             }}
              totalRows={products?.total}
              isLoading={isLoading}
              pagination={pagination}
              setPagination={setPagination}
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              downloadRecords={
                perms.canDownloadProducts ? () => handleDownloadProducts() : undefined
              }
              isDownloading={isDownloading}
            />
          ) : (
            <div>You don't have access to view the product details!</div>
          )}
        </div>
      </div>
    </>
  )
}
