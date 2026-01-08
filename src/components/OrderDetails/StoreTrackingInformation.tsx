'use client'
import React, { useState } from 'react'
import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FormDialog from '@/components/form/FormDialogBox'
import PdfViewerComponent from '@/components/utils/PdfViewver'
import TrackOrders from './TrackOrders'
import ProductCard from './ProductCard'
import { LogisticsInfo } from './LogisticsInfo'
import ChangeStoreDialog from './ChangeStore'
import { CancelItemModal } from './CancelItemModal'
import { Dialog, DialogTrigger } from '../ui/dialog'
import ViewPrescription from './ViewPrescription'
import { RegeneratePrescriptionDialog } from './RegeneratePrescriptionDialog'
import { useChangeStoreOrderPrescriptionStatus } from '@/utils/hooks/prescriptionStatus'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export default function StoreTrackingInformation({
  order,
  selectedStoreTracking,
  selectedStore,
  selectedOrderTracking,
  refreshData,
  hasModifyPermission,
  hasReadPermission,
  isStoreAdmin,
  productBatchNo,
  setProductBatchNo,
  isSuperAdmin,
  queryClient,
  selectedProduct,
  pharmacistDetails
}: any) {
  const hasCancelOrderPermission: any = hasPermission(
    MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
    MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.CANCEL_ORDER
  )

  const storeTracking = selectedStoreTracking
  if (!storeTracking) return null

  const products =
    storeTracking?.type === 'order'
      ? storeTracking?.items?.filter(
          (i: any) => !i.isCancelRequested && !i.isReturnRequested
        )
      : storeTracking?.items

  const changeStoreOrderPrescriptionStatusMutation =
    useChangeStoreOrderPrescriptionStatus()

  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [disablePrescriptionButtons, setDisablePrescriptionButtons] =
    useState<boolean>(false)

  const handlePrescriptionStatusChange = async (
    status: 'accept' | 'reject'
  ) => {
    try {
      await changeStoreOrderPrescriptionStatusMutation.mutateAsync({
        orderId: order?._id,
        storeId: selectedStore?._id,
        status,
        orderTrackingId: selectedOrderTracking?._id
      })

      await queryClient.invalidateQueries({ queryKey: ['get-orders'] })
      await queryClient.invalidateQueries({ queryKey: ['get-order-tracking'] })
      await queryClient.invalidateQueries({
        queryKey: ['get-store-admin-orders']
      })
      setDisablePrescriptionButtons(true)
    } catch (error) {}
  }

  return (
    <div className='py-6'>
      <div className='grid grid-cols-3 gap-4 rounded-md border border-b p-4 pb-6'>
        <div className='col-span-3'>
          <p className='text-lg font-semibold'>Store Information</p>
        </div>
        <div className='space-y-2'>
          <p className='font-semibold'>Store Name</p>
          <p className={'text-sm'}>{storeTracking?.store?.storeName}</p>
        </div>
        <div className='space-y-2'>
          <p className='font-semibold'>Store ID</p>
          <p className={'text-sm'}>
            {storeTracking?.store?.storeCode ?? storeTracking?.store?.storeId}
          </p>
        </div>
        <div className='space-y-2'>
          <p className='font-semibold'>Phone Number</p>
          <p className={'text-sm'}>{storeTracking?.store?.phoneNumber}</p>
        </div>

        <div className={'flex items-center gap-3 pt-4'}>
          {hasModifyPermission && (
            <ChangeStoreDialog
              order={order}
              storeTracking={storeTracking}
              refreshData={refreshData}
            />
          )}

          {hasModifyPermission && (
            <FormDialog
              footerNotReq={true}
              className='md:w-[1200px]'
              content={
                <div className='h-[600px] overflow-y-auto'>
                  <PdfViewerComponent
                    pdfUrl={storeTracking?.invoiceUrl}
                    fileName={`Order-${order?.orderId}-invoice`}
                  />
                </div>
              }
              trigger={
                <Button
                  variant={'outline'}
                  className={'text-primary'}
                  disabled={!storeTracking.invoiceUrl}
                >
                  <FileDown /> Download Invoice
                </Button>
              }
              title={'Document'}
              footerActions={() => <></>}
            />
          )}
        </div>
      </div>

      <div className='grid grid-cols-[2fr_1fr] gap-6 py-6'>
        <div>
          {storeTracking?.type == 'order' &&
            storeTracking.timeline.find(
              (t: any) => t.statusCode === 'dispatched'
            ) && (
              <div>
                <LogisticsInfo tracking={storeTracking} />
              </div>
            )}

          {storeTracking?.type == 'return' &&
            storeTracking.timeline.find(
              (t: any) => t.statusCode === 'return_to_origin'
            ) && (
              <div>
                <LogisticsInfo tracking={storeTracking} />
              </div>
            )}

          {products && (
            <div className='pb-3 text-lg font-semibold'>Products</div>
          )}
          <div className='space-y-4'>
            {products?.map((orderItem: any, index: number) => (
              <div key={index}>
                <ProductCard
                  orderItem={orderItem}
                  storeTracking={storeTracking}
                  isStoreAdmin={isStoreAdmin}
                  setProductBatchNo={setProductBatchNo}
                  productBatchNo={productBatchNo}
                  order={order}
                  selectedProduct={selectedProduct}
                  refreshData={refreshData}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className='pb-3 text-lg font-semibold'>Track Order</div>
          <div className='rounded-md border border-gray-300 p-4'>
            <div>
              {selectedStore && (
                <TrackOrders
                  orderId={order?._id}
                  storeId={selectedStore?._id}
                  prescriptionRequired={
                    order?.hasPrescription &&
                    selectedOrderTracking?.hasPrescriptionVerification
                  }
                  order={order}
                  orderTracking={selectedOrderTracking}
                  statusValidations={{ productBatchNo }}
                  onUpdateStatus={() => {
                    refreshData({ resetStateToDefault: false })
                  }}
                  disableStatusChange={order?.status == 'refunded'}
                  disabled={!hasModifyPermission}
                  refreshOrder={() =>
                    refreshData({ resetStateToDefault: false })
                  }
                  pharmacistDetails={pharmacistDetails?.data}
                />
              )}
            </div>

            <div>
              {order?.hasPrescription &&
                selectedStoreTracking?.type === 'order' &&
                hasReadPermission &&
                selectedOrderTracking?.hasPrescriptionVerification && (
                  <div className='px-4'>
                    <Dialog>
                      <DialogTrigger
                        disabled={!order?.prescription?.urls?.length}
                        className='w-full'
                      >
                        <Button
                          disabled={!order?.prescription?.urls?.length}
                          className='w-full'
                        >
                          View prescription
                        </Button>
                      </DialogTrigger>
                      <ViewPrescription
                        orderId={order?.orderId}
                        status='paid'
                        showActions
                        prescription={order?.prescription?.urls}
                        disableActionButtons={
                          !!selectedStoreTracking.timeline.find(
                            (t: any) => t.statusCode === 'dispatched'
                          ) ||
                          disablePrescriptionButtons ||
                          !hasModifyPermission ||
                          (isStoreAdmin &&
                            selectedOrderTracking?.lastTimelineStatus ===
                              'prescription_being_generated')
                        }
                        handlePrescriptionStatusChange={
                          handlePrescriptionStatusChange
                        }
                      />
                    </Dialog>
                  </div>
                )}
            </div>

            <div>
              {order?.hasPrescription &&
                isSuperAdmin &&
                hasModifyPermission &&
                !selectedStoreTracking?.timeline?.some(
                  (t: any) =>
                    t.statusCode === 'prescription_approved' ||
                    t.statusCode === 'cancelled'
                ) && (
                  <div className='p-4'>
                    <RegeneratePrescriptionDialog orderId={order?._id} />
                  </div>
                )}
            </div>

            {!selectedStoreTracking?.timeline?.some(
              (t: any) =>
                t.statusCode === 'dispatched' || t.statusCode === 'cancelled'
            ) &&
              selectedStoreTracking?.type === 'order' &&
              isSuperAdmin &&
              hasCancelOrderPermission && (
                <div>
                  <div className='px-4'>
                    <Button
                      variant={'outline'}
                      size={'sm'}
                      onClick={() => setCancelDialogOpen(true)}
                      className='w-full border-red-600'
                    >
                      <p className='font-semibold text-red-600'>Cancel Items</p>
                    </Button>
                  </div>

                  <CancelItemModal
                    open={isCancelDialogOpen}
                    onOpenChange={setCancelDialogOpen}
                    items={products}
                    order={order}
                    tracking={storeTracking}
                    onConfirm={() => {
                      setCancelDialogOpen(false)
                      refreshData()
                    }}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
