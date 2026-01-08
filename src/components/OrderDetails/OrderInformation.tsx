'use client'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import {
  useReprocessCheckoutFailedOrder,
  useChangeOrderDeliveryMode
} from '@/utils/hooks/orderHooks'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import ProductDetailsComponent from './ProductDetails'
import PreviousOrders from './PreviousOrders'

export default function OrderInformation({
  order,
  setSelectedStoreTracking,
  setSelectedProduct,
  setSelectedOrderTracking,
  setSelectedStore,
  scrollToTop,
  isStoreAdmin
}: any) {
  const [deliveryMode, setDeliveryMode] = useState('')
  const [isReprocessLoading, setIsReprocessLoading] = useState(false)

  const { mutateAsync: reProcessOrder } = useReprocessCheckoutFailedOrder()
  const { mutateAsync: changeDeliveryMode } = useChangeOrderDeliveryMode()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (order) setDeliveryMode(order?.deliveryMode)
  }, [order])

  const processCheckoutFailedOrder = async () => {
    if (isReprocessLoading) return
    try {
      setIsReprocessLoading(true)
      await reProcessOrder({ data: { orderId: order?._id } })
      queryClient.invalidateQueries({ queryKey: ['get-orders'] })
    } catch (e) {
      console.error(e)
    } finally {
      setIsReprocessLoading(false)
    }
  }

  const handleDeliveryModeChange = async (newMode: string) => {
    try {
      setDeliveryMode(newMode)
      await changeDeliveryMode({
        data: {
          orderId: order?._id,
          deliveryMode: newMode,
          userType: 'super-admin'
        }
      })
      queryClient.invalidateQueries({ queryKey: ['get-orders'] })
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectTrack = ({ storeTracking, orderItem }: any) => {
    setSelectedOrderTracking(storeTracking)
    setSelectedStoreTracking(storeTracking)
    setSelectedProduct(orderItem)
    setSelectedStore(storeTracking?.store)

    scrollToTop && scrollToTop()
  }

  return (
    <div className='py-6'>
      <div className='border-b pb-9'>
        <div className='mb-6 text-xl font-semibold'>Order Information</div>
        <div className='grid grid-cols-3 gap-6 text-sm'>
          <div className='space-y-2'>
            <p className='text-sm font-semibold'>Order Id</p>
            <p className={'text-sm'}>{order?.orderId}</p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Order Date</p>
            <p className={'text-sm'}>
              {dayjs(order?.createdAt).format(process.env.DATE_TIME_FORMAT)}
            </p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Order Status</p>
            <p className={'text-sm capitalize'}>{order?.status}</p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Delivery Mode</p>
            <p className={'text-sm uppercase'}>{order?.deliveryMode}</p>
          </div>
          {order?.orderItemTracking?.[0]?.timeline?.some(
            (t: any) => t.statusCode === 'delivered'
          ) && (
            <div className='space-y-2'>
              <p className='font-semibold'>Delivery Date</p>
              <p className={'text-sm'}>
                {dayjs(
                  order?.orderItemTracking?.[0]?.timeline?.find(
                    (t: any) => t.statusCode === 'delivered'
                  )?.date
                ).format(process.env.DATE_TIME_FORMAT)}
              </p>
            </div>
          )}
          <div className='space-y-2'>
            <p className='font-semibold'>Total Tax</p>
            <p className={'text-sm'}>
              Rs. {Number(order?.taxAmount).toFixed(2)}
            </p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>CouponCode Used</p>
            <p className={'text-sm'}>
              {order?.couponCode ? order?.couponCode : 'none'}
            </p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Davacoins Used</p>
            <p className={'text-sm'}>
              {order?.davaCoinsUsed ? order?.davaCoinsUsed : 'none'}
            </p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Discount Value</p>
            <p className={'text-sm'}>
              Rs. {Number(order?.discountedAmount).toFixed(2)}
            </p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Total Amount</p>
            <p className={'text-sm'}>
              ₹{Number(order?.orderTotal + order?.discountedAmount).toFixed(2)}
            </p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Amount to be paid</p>
            <p className={'text-sm'}>₹{Number(order?.orderTotal).toFixed(2)}</p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Payment Order Id</p>
            <p className={'text-sm'}>{order?.paymentOrderId}</p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Payment Transaction Id</p>
            <p className={'text-sm'}>{order?.paymentTransactionId}</p>
          </div>

          {order?.totalRefundAmount > 0 && (
            <div className='space-y-2 text-red-600'>
              <p className='font-semibold'>Total Refunded Amount</p>
              <p className={'text-sm'}>
                ₹{Number(order?.totalRefundAmount).toFixed(2)}
              </p>
            </div>
          )}
          {order?.refundTransactionIds?.length > 0 && (
            <div className='space-y-2'>
              <p className='font-semibold'>Refunded Transaction IDs</p>
              <p className={'text-sm'}>
                {order?.refundTransactionIds?.join(', ')}
              </p>
            </div>
          )}

          {order?.isSessionFailedOrder && (
            <div className='space-y-2'>
              <p className='font-semibold'>Checkout Failed Order</p>
              <p className={'text-sm uppercase'}>
                <Button
                  disabled={isReprocessLoading}
                  loader={isReprocessLoading}
                  onClick={() => processCheckoutFailedOrder()}
                >
                  Re-process Order
                </Button>
              </p>
            </div>
          )}
          {order?.deliveryMode == 'oneDay' &&
            order?.orderItemTracking.length &&
            [
              'order_placed',
              'order_under_verification',
              'order_confirmed',
              'order_transferred_to_another_shop',
              'prescription_approved',
              'prescription_being_generated',
              'prescription_generated'
            ].includes(order?.orderItemTracking[0]?.lastTimelineStatus) && (
              <Select
                value={deliveryMode}
                onValueChange={newMode => handleDeliveryModeChange(newMode)}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Delivery Mode' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='oneDay'>One Day</SelectItem>
                    <SelectItem value='standard'>Standard</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
        </div>
      </div>
      <div className='border-b py-9 text-sm'>
        <div className='mb-6 text-xl font-semibold'>Customer Information</div>
        <div className='grid grid-cols-3 gap-6'>
          <div className='space-y-2'>
            <p className='font-semibold'>Customer Name</p>
            <p className={'text-sm'}>{order?.userId?.name}</p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Customer Phone No.</p>
            <p className={'text-sm'}>{order?.address?.phoneNumber}</p>
          </div>
          {order?.address?.alternatePhoneNumber && (
            <div className='space-y-2'>
              <p className='font-semibold'>Customer Alternate Phone No.</p>
              <p className={'text-sm'}>
                {order?.address?.alternatePhoneNumber}
              </p>
            </div>
          )}
          <div className='space-y-2'>
            <p className='font-semibold'>Customer Email</p>
            <p className={'text-sm'}>{order?.userId?.email}</p>
          </div>
          <div className='col-span-3 space-y-2'>
            <p className='font-semibold'>Delivery Address</p>
            <div className={'text-sm'}>
              {/* <div>{order.address.userName}</div>
                  <div>
                    {order.address.addressLine1}{' '}
                    {order.address.addressLine2}, {order.address.city},{' '}
                    {order.address.state} {order.address.postalCode}
                  </div>
                  <div>{order.address.phoneNumber}</div> */}
              <div className='grid w-full grid-cols-3 gap-6'>
                <div className='capitalize'>{order?.address?.userName}</div>
                <div>
                  Address:{' '}
                  {order?.address?.addressLine1 +
                    ' ' +
                    order?.address?.addressLine2}
                </div>
                <div>City: {order?.address?.city}</div>
                <div>State: {order?.address?.state}</div>
                <div>Pin code: {order?.address?.postalCode}</div>
                <div>Country: India</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {order?.patientId && order?.patientId !== undefined && (
        <div className='border-b py-9 text-sm'>
          <div className='mb-6 text-xl font-semibold'>Patient Information</div>
          <div className='grid grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <p className='font-semibold'>Patient Name</p>
              <p className={'text-sm'}>{order?.patientId?.name}</p>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold'>Patient Phone No.</p>
              <p className={'text-sm'}>{order?.patientId?.phoneNumber}</p>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold'>Patient Email</p>
              <p className={'text-sm'}>{order?.patientId?.email}</p>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold'>Patient Relation</p>
              <p className={'text-sm'}>{order?.patientId?.relation}</p>
            </div>
          </div>
        </div>
      )}

      <div className='py-9'>
        <div className='mb-5 text-xl font-semibold'>Stores and Products</div>
        <div className='space-y-4'>
          {order?.orderItemTracking?.map(
            (storeTracking: any, index: number) => (
              <div key={index}>
                <ProductDetailsComponent
                  storeTracking={storeTracking}
                  isCancelOrReturn={false}
                  onSelectTrack={handleSelectTrack}
                />
              </div>
            )
          )}
        </div>
      </div>

      {order?.cancelAndReturnTrackings?.length > 0 && (
        <div className='py-9'>
          <div className='mb-5 text-xl font-semibold text-red-600'>
            Cancels and Returns
          </div>
          <div className='space-y-4'>
            {order?.cancelAndReturnTrackings?.map(
              (storeTracking: any, index: number) => (
                <div key={index}>
                  <ProductDetailsComponent
                    storeTracking={storeTracking}
                    isCancelOrReturn={true}
                    onSelectTrack={handleSelectTrack}
                  />
                </div>
              )
            )}
          </div>
        </div>
      )}

      {order?.userId?._id && (
        <PreviousOrders
          userId={order.userId._id}
          currentOrderId={order._id}
          isStoreAdmin={isStoreAdmin}
        />
      )}
    </div>
  )
}
