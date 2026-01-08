'use client'
import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import AppBreadcrumb from '@/components/Breadcrumb'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useGetOrder } from '@/utils/hooks/orderHooks'
import OrderInformation from './OrderInformation'
import StoreTrackingInformation from './StoreTrackingInformation'
import { getBreadCrumbPathFactory } from './orderUtils'
import { useGetStoreAdminOrder } from '@/utils/hooks/storeAdminOrder'
import { useFetchPharmacistDetails } from '@/utils/hooks/storePharmacistHooks'

export default function OrderDetails({
  params,
  isStoreAdmin
}: {
  params: { orderId: string }
  isStoreAdmin?: boolean
}) {
  const { data: session } = useSession()
  const { user } = session ?? {}
  const searchParams = useSearchParams()
  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const pharmacist = searchParams.get('pharmacist')
  const isSuperAdmin = user?.role === 'super-admin'

  const [lastRefreshedAt, setLastRefreshedAt] = useState<any>(
    new Date().getTime()
  )
  const [selectedStoreTracking, setSelectedStoreTracking] = useState<any>(null)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<any>(null)
  const [productBatchNo, setProductBatchNo] = useState({})

  const orderHook = isStoreAdmin ? useGetStoreAdminOrder : useGetOrder

  const pharmacistDetails = isStoreAdmin
    ? useFetchPharmacistDetails(pharmacist)
    : null

  const { data: order, isLoading } = orderHook(params.orderId, lastRefreshedAt)

  const queryClient = useQueryClient()

  const modifyPermission = hasPermission(
    MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
    MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.CHANGE_ORDER_STORE
  )
  const readPermission = hasPermission(
    MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
    MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.READ_ORDER
  )

  useEffect(() => {
    if (order) {
      if (!selectedOrderTracking) return
      setProductBatchNo({})
      // for (const orderTracking of order?.orderItemTracking) {
      const storeId = selectedOrderTracking?.store
        ? selectedOrderTracking?.store?._id
        : ''
      for (const item of selectedOrderTracking?.items) {
        const { batchNo = '', suggestedBatchNo, product } = item

        if (!product) continue

        const { _id: productId, batches = [] } = product

        const batch = batches.find((b: any) => b.batchNo === batchNo)
        const suggestedBatch = batches.find(
          (b: any) => b.batchNo === suggestedBatchNo
        )
        if (
          (batch || suggestedBatch) &&
          !item.isCancelRequested &&
          !item.isReturnRequested
        ) {
          const selectedBatch = batch || suggestedBatch
          setProductBatchNo(prev => ({
            ...prev,
            [`${storeId}_${productId}`]: {
              ...selectedBatch,
              storeId,
              productId
            }
          }))
        }
        // }
      }
    }
  }, [selectedOrderTracking])

  const refreshData = (
    { resetStateToDefault }: { resetStateToDefault?: boolean | undefined } = {
      resetStateToDefault: true
    }
  ) => {
    if (resetStateToDefault) {
      setSelectedStoreTracking(null)
      setSelectedProduct(null)
      setSelectedOrderTracking(null)
      setLastRefreshedAt(new Date().getTime())
    }

    queryClient.invalidateQueries({ queryKey: ['get-orders'] })
    queryClient.invalidateQueries({ queryKey: ['get-store-admin-orders'] })
    queryClient.invalidateQueries({ queryKey: ['get-order-tracking'] })
  }

  const scrollToTop = () => {
    setTimeout(() => {
      const el = document.getElementById('order-details-page')
      if (el) el.scroll({ top: -20, behavior: 'smooth' })
    }, 0)
  }

  const getBreadCrumbPath = getBreadCrumbPathFactory({
    isStoreAdmin,
    page,
    limit,
    pharmacist,
    order,
    selectedProduct,
    refreshData,
    params,
    setSelectedStoreTracking,
    setSelectedProduct
  })

  return (
    <div id='order-details-page' className='h-screen overflow-y-auto'>
      {isLoading ? (
        <div
          className='flex flex-col items-center justify-center gap-3'
          style={{ height: 'calc(100vh - 60px)' }}
        >
          <div className='loader' />
          <div className='text-sm font-semibold'>Loading ...</div>
        </div>
      ) : (
        <>
          <div className='flex items-center justify-between border-b pb-4 dark:border-gray-600'>
            <AppBreadcrumb locations={getBreadCrumbPath()} />

            <div className='flex items-center gap-4'>
              {pharmacistDetails?.data && (
                <div className='flex flex-col'>
                  <span className='text-xs'>
                    Pharmacist Name: {pharmacistDetails?.data?.name}
                  </span>
                  <span className='text-xs'>
                    Employee Id: {pharmacistDetails?.data?.employeeId}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            {selectedStoreTracking ? (
              <StoreTrackingInformation
                order={order}
                selectedStore={selectedStore}
                selectedStoreTracking={selectedStoreTracking}
                setSelectedStoreTracking={setSelectedStoreTracking}
                setSelectedProduct={setSelectedProduct}
                setSelectedOrderTracking={setSelectedOrderTracking}
                selectedOrderTracking={selectedOrderTracking}
                setSelectedStore={setSelectedStore}
                refreshData={refreshData}
                hasModifyPermission={modifyPermission}
                hasReadPermission={readPermission}
                isStoreAdmin={isStoreAdmin}
                productBatchNo={productBatchNo}
                setProductBatchNo={setProductBatchNo}
                isSuperAdmin={isSuperAdmin}
                queryClient={queryClient}
                selectedProduct={selectedProduct}
                pharmacistDetails={pharmacistDetails}
              />
            ) : (
              <OrderInformation
                order={order}
                setSelectedStoreTracking={setSelectedStoreTracking}
                setSelectedProduct={setSelectedProduct}
                setSelectedOrderTracking={setSelectedOrderTracking}
                setSelectedStore={setSelectedStore}
                refreshData={refreshData}
                hasModifyPermission={modifyPermission}
                hasReadPermission={readPermission}
                isStoreAdmin={isStoreAdmin}
                scrollToTop={scrollToTop}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
