'use client'
import React from 'react'
import dayjs from 'dayjs'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import StockAdjustmentDialog from './StockAdjustmentDialog'
import { calculateTaxes } from './orderUtils'
import { useUpdateOrderItemBatchNo } from '@/utils/hooks/orderItemHook'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import FormDialog from '../form/FormDialogBox'
import { DialogClose } from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import ModifyReturnQuantity from './ModifyReturn'

export default function ProductCard({
  orderItem,
  storeTracking,
  isStoreAdmin,
  setProductBatchNo,
  setLastRefreshedAt,
  order,
  productBatchNo,
  selectedProduct,
  refreshData
}: {
  orderItem: any
  storeTracking: any
  isStoreAdmin: any
  setProductBatchNo: any
  setLastRefreshedAt?: any
  order: any
  productBatchNo: any
  selectedProduct: any
  refreshData: () => void
}) {
  const isReturnRequested =
    storeTracking?.type === 'return' || storeTracking?.type === 'partial-return'
  const isCancelRequested = storeTracking?.type === 'cancel'

  const isReturnApproved = (storeTracking?.timeline ?? [])?.some(
    (t: any) => t.statusCode === 'return_approved'
  )

  const { toast } = useToast()
  const { mutateAsync: updateBatchNo } = useUpdateOrderItemBatchNo()

  const handleBatchNoChange = async (batchNo: string) => {
    try {
      await updateBatchNo({
        orderItemId: orderItem?._id,
        batchNo,
        role: 'admin'
      })
      const batch = orderItem?.product?.batches?.find(
        (b: any) => b.batchNo === batchNo
      )
      orderItem.batchNo = batchNo
      setProductBatchNo((prev: any) => ({
        ...prev,
        [`${storeTracking?.store?._id}_${orderItem?.product?._id}`]: {
          ...batch,
          storeId: storeTracking?.store?._id,
          productId: orderItem?.product?._id
        }
      }))
    } catch (e) {
      console.error(e)
      toast({
        title: 'Error',
        description: (e as any)?.response?.data?.message
      })
    }
  }

  if (!orderItem?.product)
    return (
      <div className='p-3 text-sm font-medium text-red-600'>
        Product missing in system
      </div>
    )

  const getTotalOrderedQuantity = (): number => {
    const item = order?.items?.find(
      (i: any) => i.productId === orderItem?.product?._id
    )

    return item?.quantity ?? 0
  }

  return (
    <div
      className={`rounded-md border bg-white p-4 ${isReturnRequested || isCancelRequested ? 'border-2 border-red-600' : 'border-gray-300'}`}
    >
      {(isReturnRequested || isCancelRequested) && (
        <div>
          <p className='text-right text-sm font-semibold text-red-600'>
            {isCancelRequested
              ? 'Cancelled'
              : storeTracking?.timeline?.length &&
                storeTracking?.timeline[storeTracking?.timeline?.length - 1]
                  ?.label}
          </p>

          {isReturnRequested && !isReturnApproved && (
            <div className='mt-4 flex justify-end'>
              <ModifyReturnQuantity
                maxQuantity={getTotalOrderedQuantity() - 1}
                orderItemTrackingId={storeTracking._id}
                orderItemId={orderItem._id}
                refreshData={refreshData}
              />
            </div>
          )}
        </div>
      )}
      <div className='flex gap-6'>
        <div className={'flex w-[150px] items-center justify-center'}>
          <Image
            src={orderItem?.product?.thumbnail}
            width={120}
            height={120}
            style={{ objectFit: 'contain' }}
            className='rounded-lg'
            alt=''
          />
        </div>
        <div className='flex w-full flex-col gap-4 text-sm'>
          <div className='flex items-center gap-3'>
            <p className='w-36 font-semibold'>Product SKU:</p>
            <p>{orderItem?.product?.sku}</p>
          </div>

          <div className='flex items-center gap-3'>
            <p className='w-36 font-semibold'>Name:</p>
            <p>{orderItem?.product?.title}</p>
          </div>
          <div className='flex items-center gap-3'>
            <p className='w-36 font-semibold'>Quantity:</p>
            <p>{orderItem?.quantity}</p>
          </div>
          {orderItem?.product?.taxes?.length ? (
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-3'>
                <p className='w-36 font-semibold'>Tax Applied:</p>
                <div className='flex flex-col gap-1'>
                  {calculateTaxes(orderItem).map((tax: any, idx: number) => (
                    <div key={idx} className=''>
                      <span>{tax?.name}</span>
                      <span className='ml-2'>
                        Rs. {Number(tax.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <p className='w-36 font-semibold'>Total Tax:</p>
                <div>{Number(order?.taxAmount).toFixed(2)}</div>
              </div>
            </div>
          ) : null}
          <div className='flex items-center gap-3'>
            <p className='w-36 font-semibold'>Price:</p>
            <p>{Number(orderItem?.product?.finalPrice).toFixed(2)}</p>
          </div>
          <div className='flex items-center gap-3'>
            <p className='w-36 font-semibold'>Discount:</p>
            <p className='text-red-600'>
              -{Number(orderItem?.discountAmount).toFixed(2)}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <p className='w-36 font-semibold'>MRP:</p>
            <p>
              {Number(
                orderItem?.product?.finalPrice * orderItem?.quantity
              ).toFixed(2)}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <p className='w-36 font-semibold'>Total Price:</p>
            <p>
              {Number(
                orderItem?.product?.finalPrice * orderItem?.quantity -
                  orderItem?.discountAmount
              ).toFixed(2)}
            </p>
          </div>
          <div className={'flex items-center gap-10'}>
            <div>
              <div className={'font-semibold'}>
                Batch No
                {storeTracking?.isSplitted && (
                  <span className='ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-600'>
                    Transferred
                  </span>
                )}
              </div>
              <div className='mb-1 text-xs text-gray-500'>
                Store: {storeTracking?.store?.storeName}
              </div>

              <Select
                disabled={
                  orderItem.batchNo &&
                  storeTracking.lastTimelineStatus === 'dispatched'
                }
                defaultValue={orderItem.batchNo ?? orderItem.suggestedBatchNo}
                onValueChange={(batchNo: string) =>
                  handleBatchNoChange(batchNo)
                }
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Batch No' />
                </SelectTrigger>
                <SelectContent>
                  {orderItem?.product?.batches?.map(
                    (b: any, batchIdx: number) => (
                      <SelectItem key={batchIdx} value={b.batchNo}>
                        {b.batchNo}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className={'font-semibold'}>Expiry Date</div>
              <div className={'flex h-10 items-center'}>
                <div>
                  {orderItem.batchNo
                    ? dayjs(
                        orderItem.product?.batches?.find(
                          (b: any) => b.batchNo === orderItem.batchNo
                        )?.expiryDate
                      ).format(process.env.DATE_FORMAT)
                    : orderItem?.product
                      ? productBatchNo[
                          `${storeTracking.store._id}_${orderItem?.product?._id}`
                        ]
                        ? dayjs(
                            productBatchNo[
                              `${storeTracking.store._id}_${orderItem?.product?._id}`
                            ]?.expiryDate
                          ).format(process.env.DATE_FORMAT)
                        : '--'
                      : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Stock Adjustment Button for Store Admin */}
          {isStoreAdmin && (
            <div className={'mt-4 flex justify-end'}>
              <StockAdjustmentDialog
                product={orderItem.product}
                storeId={storeTracking?.store?._id}
                inventoryId={orderItem.product?.inventory?._id}
                onSuccess={() => {
                  // Refresh the order data after stock adjustment
                  setLastRefreshedAt(new Date().getTime())
                }}
              />
            </div>
          )}
        </div>
      </div>

      {isReturnRequested && (
        <>
          <div className='mt-6 border-t border-red-600 py-3'>
            <div className='flex flex-col gap-4'>
              <p className='text-sm font-medium'>
                Return Reason: {selectedProduct?.returnDetails?.reason}
              </p>
              <p className='text-sm font-medium'>
                Note: {selectedProduct?.returnDetails?.comment}
              </p>
              <div>
                <p className='text-sm font-medium'>Images</p>
                <div className='grid grid-cols-2 gap-4 p-4'>
                  {selectedProduct?.returnDetails?.images &&
                    selectedProduct.returnDetails?.images.map(
                      (image: any, idx: number) => {
                        const imageUrls = Array.isArray(image?.objectUrl)
                          ? image?.objectUrl
                          : [image?.objectUrl]

                        return imageUrls.map((url: string, subIdx: number) => {
                          const isPDF =
                            typeof url === 'string' &&
                            url.toLowerCase().includes('.pdf')

                          const previewContent = isPDF ? (
                            <iframe
                              src={url}
                              title={`PDF preview ${idx + 1}-${subIdx + 1}`}
                              width='100%'
                              height='600px'
                              className='rounded border'
                            />
                          ) : (
                            <Image
                              src={url}
                              alt={`Uploaded image ${idx + 1}-${subIdx + 1}`}
                              width={600}
                              height={600}
                            />
                          )

                          const thumbnail = isPDF ? (
                            <div className='relative flex h-40 w-40 items-center justify-center rounded-md border bg-gray-100 p-2'>
                              <iframe
                                src={url}
                                title={`PDF preview ${idx + 1}-${subIdx + 1}`}
                                width='100%'
                                className='rounded border'
                              />
                            </div>
                          ) : (
                            <div className='relative h-40 w-40 rounded-md border p-2'>
                              <Image
                                src={url}
                                alt={`Uploaded image ${idx + 1}-${subIdx + 1}`}
                                fill
                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                style={{ objectFit: 'contain' }}
                              />
                            </div>
                          )

                          return (
                            <FormDialog
                              key={`${idx}-${subIdx}`}
                              content={
                                <div className='h-full w-full'>
                                  {previewContent}
                                </div>
                              }
                              trigger={thumbnail}
                              title={isPDF ? 'PDF Document' : 'Product Image'}
                              footerActions={() => (
                                <div className='flex items-center justify-end'>
                                  <DialogClose>
                                    <Button variant='secondary'>Close</Button>
                                  </DialogClose>
                                </div>
                              )}
                              footerNotReq={false}
                            />
                          )
                        })
                      }
                    )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
