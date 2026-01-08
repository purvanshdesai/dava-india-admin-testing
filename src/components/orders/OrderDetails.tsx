'use client'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { FileDown, FilePenLine } from 'lucide-react'
import {
  useChangeOrderDeliveryMode,
  useGetOrder,
  useReprocessCheckoutFailedOrder
} from '@/utils/hooks/orderHooks'
import Image from 'next/image'
import { Dialog, DialogClose, DialogTrigger } from '@/components/ui/dialog'
import TrackOrders from '../OrderDetails/TrackOrders'
import { useChangeStoreSuperAdmin } from '@/utils/hooks/changeStoreSuperAdmin'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import AppBreadcrumb from '@/components/Breadcrumb'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import ViewPrescription from '../OrderDetails/ViewPrescription'
import { useChangeStoreOrderPrescriptionStatus } from '@/utils/hooks/prescriptionStatus'
import { useSearchParams } from 'next/navigation'
import PdfViewerComponent from '@/components/utils/PdfViewver'
import FormDialog from '@/components/form/FormDialogBox'
import { useGetStoreAdminOrder } from '@/utils/hooks/storeAdminOrder'
import { useChangeStore } from '@/utils/hooks/changeStore'
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useUpdateOrderItemBatchNo } from '@/utils/hooks/orderItemHook'
import { useToast } from '@/hooks/use-toast'
import { DialogContent } from '@radix-ui/react-dialog'
import ChangeStore from './ChangeStore'
import { useRouter } from 'next/navigation'
import { useFetchPharmacistDetails } from '@/utils/hooks/storePharmacistHooks'
import { RegeneratePrescriptionDialog } from '../OrderDetails/RegeneratePrescriptionDialog'
import {
  useStoreAdminPartialOrderTransfer,
  useSuperAdminPartialOrderTransfer
} from '@/utils/actions/changeStore'
import StockAdjustmentDialog from '../OrderDetails/StockAdjustmentDialog'

// const productStatusTypes = ['order', 'return', 'cancel']

export default function OrderDetails({
  params,
  isStoreAdmin
}: {
  params: { orderId: string }
  isStoreAdmin?: boolean
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const pharmacist = searchParams.get('pharmacist')

  const [lastRefreshedAt, setLastRefreshedAt] = useState<any>(
    new Date().getTime()
  )

  const orderHook = isStoreAdmin ? useGetStoreAdminOrder : useGetOrder

  const pharmacistDetails = isStoreAdmin
    ? useFetchPharmacistDetails(pharmacist)
    : null

  const { data: order, isLoading } = orderHook(params.orderId, lastRefreshedAt)

  const { mutateAsync: updateBatchNo } = useUpdateOrderItemBatchNo()
  const { mutateAsync: reProcessOrder } = useReprocessCheckoutFailedOrder()
  const { mutateAsync: changeDeliveryMode } = useChangeOrderDeliveryMode()

  const superAdminChangeStoreMutation = useChangeStoreSuperAdmin()
  const storeAdminChangeStoreMutation = useChangeStore()
  const superAdminPartialOrderTransferMutation =
    useSuperAdminPartialOrderTransfer()
  const storeAdminPartialOrderTransferMutation =
    useStoreAdminPartialOrderTransfer()

  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<any>(null)
  const [selectedStoreTracking, setSelectedStoreTracking] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [hasModifyPermission, setHasModifyPermission] = useState<boolean>(false)
  const [hasReadPermission, setHasReadPermission] = useState<boolean>(false)
  const [isReprocessLoading, setIsReprocessLoading] = useState<boolean>(false)
  const [selectedProductStatusType, setSelectedProductStatusType] =
    useState<any>('order')
  const [disablePrescriptionButtons, setDisablePrescriptionButtons] =
    useState<boolean>(false)

  const [deliveryMode, setDeliveryMode] = useState('')

  useEffect(() => {
    if (order) setDeliveryMode(order?.deliveryMode)
  }, [order])

  const [productBatchNo, setProductBatchNo] = useState<
    Record<
      string,
      {
        batchNo: string
        expiryDate: string
        productId: string
        storeId: string
      }
    >
  >({})

  const changeStoreOrderPrescriptionStatusMutation =
    useChangeStoreOrderPrescriptionStatus()
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
    setHasModifyPermission(modifyPermission)
  }, [modifyPermission])

  useEffect(() => {
    setHasReadPermission(readPermission)
  }, [readPermission])

  const handleStoreChange = async (
    transferredStoreId: string,
    currentStoreId: string,
    cancelReason: string,
    comment: any,
    transferType?: string,
    selectedProducts?: any[]
  ) => {
    try {
      const { user } = session ?? {}
      if (!user) return

      const isSuperAdmin = user?.role === 'super-admin'

      // Handle partial transfer for super admin
      if (transferType === 'partial' && selectedProducts) {
        if (isSuperAdmin) {
          await superAdminPartialOrderTransferMutation.mutateAsync({
            transferredStoreId,
            currentStoreId,
            orderId: params.orderId,
            selectedProducts,
            cancelReason,
            comment
          })
        } else {
          await storeAdminPartialOrderTransferMutation.mutateAsync({
            transferredStoreId,
            currentStoreId,
            orderId: params.orderId,
            selectedProducts,
            cancelReason,
            comment
          })
        }
      } else {
        // Handle full transfer
        const mutationFn = !isSuperAdmin
          ? storeAdminChangeStoreMutation?.mutateAsync
          : superAdminChangeStoreMutation?.mutateAsync

        await mutationFn({
          orderId: params.orderId,
          transferredStoreId,
          currentStoreId,
          cancelReason,
          comment
        })
      }

      // Improved cache invalidation for partial transfers
      if (transferType === 'partial') {
        // Invalidate all order-related queries
        await queryClient.invalidateQueries({ queryKey: ['get-orders'] })
        await queryClient.invalidateQueries({
          queryKey: ['get-store-admin-orders']
        })
        await queryClient.invalidateQueries({
          queryKey: ['get-order-tracking']
        })

        // Force refresh the current order data
        await queryClient.refetchQueries({
          queryKey: isSuperAdmin
            ? ['get-orders', params.orderId]
            : ['get-store-admin-orders', params.orderId]
        })
      } else {
        queryClient.invalidateQueries({ queryKey: ['get-orders'] })
      }

      if (isSuperAdmin) refreshData()
      else router.push('/store/orders')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  function calculateTaxes(orderItem: any) {
    const { components } = orderItem?.gstDetails ?? {}

    // Calculate each tax amount based on the base price
    return (components ?? []).map((tax: any) => ({
      name: tax.name,
      rate: tax.rate,
      amount: tax.totalAmount
    }))
  }

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

  const getProductStatus = (product: any, lastTimelineStatus: string) => {
    const {
      isReturnRequested,
      returnTracking,
      isCancelRequested,
      cancelTracking
    } = product ?? {}

    const findProduct = (items: Array<any>) =>
      items?.find((item: any) => item?._id === product?._id)

    if (isReturnRequested) {
      const itemExists = findProduct(returnTracking?.items)
      if (itemExists) {
        const lastStatus =
          returnTracking?.timeline[returnTracking?.timeline?.length - 1]
        return lastStatus?.label
      }
    }

    if (isCancelRequested) {
      const itemExists = findProduct(cancelTracking?.items)
      if (itemExists) {
        if (itemExists) {
          const lastStatus =
            cancelTracking?.timeline[cancelTracking?.timeline?.length - 1]
          return lastStatus?.label
        }
      }
    }

    return lastTimelineStatus?.replaceAll('_', ' ')
  }

  const OrderInformation = () => {
    const { user } = session ?? {}
    if (!user) return

    const isSuperAdmin = user?.role === 'super-admin'

    const handleProductTrack = (storeTracking: any, orderItem: any) => {
      const { returnTracking, cancelTracking } = orderItem
      setSelectedOrderTracking(storeTracking)
      const tracking = returnTracking
        ? returnTracking
        : cancelTracking
          ? cancelTracking
          : storeTracking

      setSelectedStoreTracking(tracking)
      setSelectedProduct(orderItem)
      setSelectedStore(tracking?.store)
      setTimeout(() => {
        document.getElementById('order-details-page')?.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      })
    }

    const processCheckoutFailedOrder = async () => {
      if (isReprocessLoading) return
      try {
        setIsReprocessLoading(true)
        const data = {
          orderId: order?._id
        }

        await reProcessOrder({ data })
        queryClient.invalidateQueries({
          queryKey: ['get-orders']
        })
      } catch (error) {
        console.log(error)
      } finally {
        setIsReprocessLoading(false)
      }
    }

    const handleDeliveryModeChange = async (newMode: string) => {
      try {
        setDeliveryMode(newMode)

        const data = {
          orderId: order?._id,
          deliveryMode: newMode,
          userType: isSuperAdmin ? 'super-admin' : 'store-admin'
        }

        await changeDeliveryMode({ data })

        queryClient.invalidateQueries({
          queryKey: ['get-orders']
        })
      } catch (error) {
        console.error('Failed to update delivery mode', error)
      }
    }

    const productDetailsComponent = ({
      storeTracking,
      isCancelOrReturn = false
    }: any) => {
      let items = storeTracking?.items ?? []

      if (!isCancelOrReturn) {
        items = items?.filter(
          (p: any) => !p.isCancelRequested && !p.isReturnRequested
        )
      }

      return (
        <div className='rounded-md border'>
          <div
            className={`item flex justify-between p-3 text-sm ${isCancelOrReturn ? 'bg-red-100' : 'bg-gray-200'}`}
          >
            <div>
              Store Name:{' '}
              <span className='font-semibold'>
                {storeTracking?.store?.storeName}
              </span>
            </div>

            {isCancelOrReturn && (
              <div className='uppercase'>
                Type:{' '}
                <span className='font-semibold text-red-600'>
                  {storeTracking.type?.replaceAll('-', ' ')}
                </span>
              </div>
            )}
          </div>

          <div className=''>
            <div className='grid grid-cols-[160px_1fr_2fr_1fr_1fr_80px] gap-4 border-b p-3 text-sm font-semibold'>
              <div></div>
              <div>Product Id</div>
              <div>Name</div>
              <div>Quantity</div>
              <div>Status</div>
              <div></div>
            </div>

            {!items.length && (
              <div className='grid grid-cols-[160px_1fr_2fr_1fr_1fr_80px] items-center justify-center gap-4 border-b p-3 text-sm'>
                <div className='col-span-6 text-center'>No Items</div>
              </div>
            )}

            {storeTracking?.items?.map((orderItem: any, index: number) => {
              if (!isCancelOrReturn && orderItem?.isCancelRequested)
                return <></>

              return (
                <div
                  className='grid grid-cols-[160px_1fr_2fr_1fr_1fr_80px] items-center gap-4 border-b p-3 text-sm'
                  key={index}
                >
                  <div className={'flex items-center justify-center'}>
                    <Image
                      src={orderItem?.product?.images[0]?.objectUrl}
                      width={100}
                      height={100}
                      style={{ objectFit: 'contain' }}
                      className='rounded-lg'
                      alt=''
                    />
                  </div>
                  <div>
                    <p>{orderItem?.product?.sku}</p>
                  </div>
                  <div>
                    <p className='line-clamp-2'>{orderItem?.product?.title}</p>
                  </div>
                  <div>
                    <p>{orderItem?.quantity}</p>
                  </div>
                  <div className='capitalize'>
                    {getProductStatus(
                      orderItem,
                      storeTracking?.lastTimelineStatus
                    )}
                  </div>
                  <div>
                    {/* {!isCancelOrReturn && ( */}
                    <Button
                      variant={'outline'}
                      size={'sm'}
                      className='text-primary'
                      onClick={() =>
                        handleProductTrack(storeTracking, orderItem)
                      }
                    >
                      Track
                    </Button>
                    {/* )} */}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className='py-6'>
        <div>
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
                  ₹
                  {Number(order?.orderTotal + order?.discountedAmount).toFixed(
                    2
                  )}
                </p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Amount to be paid</p>
                <p className={'text-sm'}>
                  ₹{Number(order?.orderTotal).toFixed(2)}
                </p>
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
            <div className='mb-6 text-xl font-semibold'>
              Customer Information
            </div>
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
              <div className='mb-6 text-xl font-semibold'>
                Patient Information
              </div>
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
            <div className='mb-5 text-xl font-semibold'>
              Stores and Products
            </div>

            <div className='space-y-4'>
              {order?.orderItemTracking?.map(
                (storeTracking: any, index: number) => (
                  <div key={index}>
                    {productDetailsComponent({ storeTracking })}
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
                      {productDetailsComponent({
                        storeTracking,
                        isCancelOrReturn: true
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const ProductCard = (orderItem: any, storeTracking: any) => {
    const isReturnRequested =
      storeTracking?.type === 'return' ||
      storeTracking?.type === 'partial-return'
    const isCancelRequested = storeTracking?.type === 'cancel'

    const handleBatchNoChange = async (batchNo: string) => {
      try {
        // Update Order Item in DB
        await updateBatchNo({
          orderItemId: orderItem?._id,
          batchNo,
          role: session?.user?.role
        })

        const batch = orderItem?.product?.batches.find(
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
        console.log('Error updating batch no:', e)
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
              <p className='w-36 font-semibold'>Total Price:</p>
              <p>
                {Number(
                  orderItem?.product?.finalPrice * orderItem?.quantity
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
        )}
      </div>
    )
  }

  const LogisticsInfo = (tracking: any) => {
    return (
      <div className='py-9'>
        <div>
          <div className='pb-3 text-lg font-semibold'>
            Logistics Information
          </div>

          <div className='rounded-md border p-6'>
            <div className='mb-6 flex items-center justify-between text-xl font-semibold'>
              <div className={'mr-6 flex gap-3'}>
                <div>
                  {hasModifyPermission && (
                    <FormDialog
                      footerNotReq={true}
                      className='md:w-[1200px]'
                      content={
                        <div className='h-full overflow-y-auto'>
                          <PdfViewerComponent
                            pdfUrl={tracking.labelUrl}
                            fileName={`Order-${order?.orderId}-label`}
                          />
                        </div>
                      }
                      trigger={
                        <Button
                          variant={'outline'}
                          className={'text-primary'}
                          disabled={!tracking.labelUrl}
                        >
                          <FileDown />
                          Download Label
                        </Button>
                      }
                      title={'Document'}
                      footerActions={() => (
                        <div className='flex items-center gap-3'></div>
                      )}
                    />
                  )}
                </div>
                <div>
                  {hasModifyPermission && (
                    <FormDialog
                      footerNotReq={true}
                      className='md:w-[1200px]'
                      content={
                        <div className='h-full overflow-y-auto'>
                          <PdfViewerComponent
                            pdfUrl={tracking.manifestUrl}
                            fileName={`Order-${order?.orderId}-manifest`}
                          />
                        </div>
                      }
                      trigger={
                        <Button
                          variant={'outline'}
                          className={'text-primary'}
                          disabled={!tracking.manifestUrl}
                        >
                          <FileDown />
                          Download Manifest
                        </Button>
                      }
                      title={'Document'}
                      footerActions={() => (
                        <div className='flex items-center gap-3'></div>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <p className='font-semibold'>Logistics Partner</p>
                <p className={'text-sm'}>Shiprocket</p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Courier Partner</p>
                <p className={'text-sm'}>
                  {tracking.logisticPartnerCourierName}
                </p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>AWB Number</p>
                <p className={'text-sm'}>{tracking.awbNo}</p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Pickup Time</p>
                <p className={'text-sm'}>
                  {tracking.pickupScheduledAt
                    ? dayjs(tracking.pickupScheduledAt).format(
                        process.env.DATE_TIME_FORMAT
                      )
                    : '--'}
                </p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Tracking URI</p>
                <p className={'text-sm'}>--</p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Estimated Time of Delivery</p>
                <p className={'text-sm'}>
                  {tracking.etd
                    ? dayjs(tracking.etd).format(process.env.DATE_TIME_FORMAT)
                    : '--'}
                </p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Tracking Status</p>
                <p className={'text-sm'}>
                  {tracking.trackingStatus ? tracking.trackingStatus : '--'}
                </p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Package Size</p>
                <p className={'text-sm'}>{tracking?.packageSpecs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const StoreTrackingInformation = () => {
    const storeTracking = selectedStoreTracking
    const { user } = session ?? {}
    if (!user) return

    const isSuperAdmin = user?.role === 'super-admin'

    const { type, items } = storeTracking ?? {}

    const products =
      type === 'order'
        ? items?.filter(
            (i: any) => !i.isCancelRequested && !i.isReturnRequested
          )
        : items

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
              {storeTracking?.store?.storeCode
                ? storeTracking?.store?.storeCode
                : storeTracking?.store?.storeId}
            </p>
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Phone Number</p>
            <p className={'text-sm'}>{storeTracking?.store?.phoneNumber}</p>
          </div>
          <div className={'flex items-center gap-3 pt-4'}>
            {hasModifyPermission && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    disabled={storeTracking?.timeline?.find(
                      (t: any) => t.statusCode === 'dispatched'
                    )}
                  >
                    <FilePenLine className='mr-2' />
                    Change store
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <ChangeStore
                    order={order}
                    storeId={storeTracking?.store?._id}
                    onStoreChange={(
                      selectedStoreId,
                      cancelReason,
                      comment,
                      transferType,
                      selectedProducts
                    ) =>
                      handleStoreChange(
                        selectedStoreId,
                        storeTracking?.store?._id,
                        cancelReason,
                        comment,
                        transferType,
                        selectedProducts
                      )
                    }
                  />
                </DialogContent>
              </Dialog>
            )}

            {hasModifyPermission && (
              <FormDialog
                footerNotReq={true}
                className='md:w-[1200px]'
                content={
                  <div className='h-[600px] overflow-y-auto'>
                    <PdfViewerComponent
                      pdfUrl={storeTracking.invoiceUrl}
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
                    <FileDown />
                    Download Invoice
                  </Button>
                }
                title={'Document'}
                footerActions={() => (
                  <div className='flex items-center gap-3'></div>
                )}
              />
            )}
          </div>
        </div>
        <div className='grid grid-cols-[2fr_1fr] gap-6 py-6'>
          <div>
            {products ? (
              <div className='pb-3 text-lg font-semibold'>Products</div>
            ) : (
              <div></div>
            )}
            <div className='w-full'>
              <div className='space-y-4'>
                {products?.map((orderItem: any, index: number) => (
                  <div key={index}>{ProductCard(orderItem, storeTracking)}</div>
                ))}
              </div>
            </div>

            {storeTracking?.type == 'order' &&
              storeTracking.timeline.find(
                (t: any) => t.statusCode === 'dispatched'
              ) && <div>{LogisticsInfo(storeTracking)}</div>}

            {storeTracking?.type == 'return' &&
              storeTracking.timeline.find(
                (t: any) => t.statusCode === 'return_to_origin'
              ) && <div>{LogisticsInfo(storeTracking)}</div>}
          </div>

          <div>
            <div className='pb-3 text-lg font-semibold'>Track Order</div>

            <div className='rounded-md border border-gray-300 p-4'>
              {/* <div className='flex items-center gap-4 pb-4 text-sm'>
                {['return', 'cancel'].includes(storeTracking?.type) &&
                  productStatusTypes.map((type, idx) => {
                    if (['order', storeTracking?.type].includes(type))
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedProductStatusType(type)}
                          className={`w-20 cursor-pointer border-b-2 p-2 text-center capitalize ${selectedProductStatusType == type ? 'border-primary' : 'border-gray-100'}`}
                        >
                          {type}
                        </div>
                      )

                    return <></>
                  })}
              </div> */}
              <div>
                {selectedStore && (
                  <TrackOrders
                    orderId={params.orderId}
                    storeId={selectedStore?._id}
                    prescriptionRequired={
                      order?.hasPrescription &&
                      selectedOrderTracking?.hasPrescriptionVerification
                    }
                    order={order}
                    orderTracking={
                      selectedProductStatusType === 'order'
                        ? selectedOrderTracking
                        : selectedStoreTracking
                    }
                    statusValidations={{ productBatchNo }}
                    onUpdateStatus={(resp: any) => {
                      setLastRefreshedAt(new Date().getTime())
                      queryClient.invalidateQueries({
                        queryKey: ['get-orders']
                      })
                      queryClient.invalidateQueries({
                        queryKey: ['get-order-tracking']
                      })
                      queryClient.invalidateQueries({
                        queryKey: ['get-store-admin-orders']
                      })
                      if (resp && resp.lastTimelineStatus === 'dispatched') {
                        const updatedTracking = { ...resp }
                        updatedTracking.items = selectedStoreTracking.items
                        updatedTracking.store = selectedStoreTracking.store
                        for (const item of updatedTracking.items) {
                          const respItem = resp.items.find(
                            (i: any) => i?._id === item?._id
                          )
                          item.batchNo = respItem.batchNo
                        }
                        setSelectedStoreTracking((prev: any) => ({
                          ...prev,
                          ...updatedTracking
                        }))
                      }

                      if (resp && resp.lastTimelineStatus === 'canceled')
                        refreshData()
                    }}
                    disableStatusChange={
                      (selectedProductStatusType === 'order' &&
                        ['cancel', 'partial-cancel'].includes(
                          storeTracking?.type
                        )) ||
                      order?.status == 'refunded'
                    }
                    disabled={hasModifyPermission ? false : true}
                    refreshOrder={() => refreshData()}
                    pharmacistDetails={pharmacistDetails?.data}
                  />
                )}
              </div>

              <div>
                {order?.hasPrescription &&
                  selectedStoreTracking?.type === 'order' &&
                  hasReadPermission &&
                  selectedOrderTracking?.hasPrescriptionVerification && (
                    <div className='p-4'>
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
                            !hasModifyPermission
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
            </div>
          </div>
        </div>
      </div>
    )
  }

  const refreshData = () => {
    // Reset all state
    setSelectedStoreTracking(null)
    setSelectedProduct(null)
    setSelectedOrderTracking(null)
    setSelectedProductStatusType('order')
    setProductBatchNo({})

    // Force refresh with new timestamp
    setLastRefreshedAt(new Date().getTime())

    // Invalidate all related queries
    queryClient.invalidateQueries({ queryKey: ['get-orders'] })
    queryClient.invalidateQueries({ queryKey: ['get-store-admin-orders'] })
    queryClient.invalidateQueries({ queryKey: ['get-order-tracking'] })

    console.log('Order data refreshed at:', new Date().toISOString())
  }

  const getBreadCrumbPath = () => {
    const ordersPath = isStoreAdmin ? `/store/orders` : `/orders`
    const path: any = [
      {
        page: 'Orders',
        href: `${ordersPath}?page=${page || 0}&limit=${limit || 0}&pharmacist=${pharmacist}`
      },
      {
        page: `Order Id: ${order?.orderId}`,
        href: `${ordersPath}/${order?._id}?page=${page || 0}&limit=${limit || 0}&pharmacist=${pharmacist}`,
        onClickPath: () => refreshData()
      }
    ]

    if (selectedProduct) path.push({ page: selectedProduct?.product?.title })

    return path
  }

  return (
    <div className='' id='order-details-page'>
      {isLoading ? (
        <div
          className='flex flex-col items-center justify-center gap-3'
          style={{ height: 'calc(100vh - 60px)' }}
        >
          <div className='loader'></div>
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
            {selectedStoreTracking
              ? StoreTrackingInformation()
              : OrderInformation()}
          </div>
        </>
      )}
    </div>
  )
}
