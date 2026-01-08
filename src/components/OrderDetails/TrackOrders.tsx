'use client'
import { useEffect, useState } from 'react'
// import ProgressStepper from '@/components/ui/ProgressStepper'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  MapPinIcon,
  Plus,
  RefreshCcwIcon,
  Shield,
  StoreIcon,
  TruckIcon,
  UserIcon
} from 'lucide-react'

import Spinner from '@/components/Spinner'
import { useToast } from '@/hooks/use-toast'
import { hasPermission } from '@/lib/permissions'
import { useGetOrderTracking } from '@/utils/hooks/orderHooks'
import {
  useSyncOrderTimeLine,
  useTrackOrderTimeLine
} from '@/utils/hooks/useTrackOrder'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { useQueryClient } from '@tanstack/react-query'
import moment from 'moment-timezone'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import AlertBox from '../AlertBox'
import SkipLogisticsDialog from '../orders/SkipLogistics'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

const TrackOrders = ({
  orderId,
  // timelineDetails,
  storeId,
  prescriptionRequired = false,
  orderTracking,
  statusValidations,
  onUpdateStatus,
  disableStatusChange = false,
  disabled = false,
  refreshOrder,
  pharmacistDetails,
  order
}: {
  orderId: string
  // timelineDetails: any
  author?: any
  storeId?: any
  prescriptionRequired?: boolean
  order?: any
  orderTracking: any
  onUpdateStatus?: (resp?: any) => void
  statusValidations: {
    productBatchNo: Record<
      string,
      {
        batchNo: string
        expiryDate: string
        productId: string
        storeId: string
      }
    >
  }
  disableStatusChange?: boolean
  disabled?: boolean
  refreshOrder?: () => void
  pharmacistDetails?: any
}) => {
  const { data: session }: any = useSession()
  const userRole = session?.user?.role
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const updateOnSubmit = useTrackOrderTimeLine()
  const { mutateAsync: syncOrderTimeline } = useSyncOrderTimeLine()

  const { data: response, isPending } = useGetOrderTracking(
    orderId,
    userRole === 'super-admin' ? 'admin' : 'store-admin',
    storeId,
    orderTracking?._id
  )
  const userId = session?.user?.id
  const [open, setOpen] = useState(false)
  const userName = session?.user?.name ?? session?.user?.fullName

  const [newStatus, setNewStatus] = useState<any>({})
  const [openModal, setOpenModal] = useState(false)
  const [comment, setComment] = useState('')
  const [packageSize, setPackageSize] = useState('small')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  function filterByStatusCode(data: any, statusCodes: any) {
    return data.filter((item: any) => statusCodes.includes(item.statusCode))
  }
  const isSuperAdmin = userRole === 'super-admin'
  const isStoreAdmin = userRole === 'store-admin'

  const hasCancelOrderPermission: any = hasPermission(
    MODULES_PERMISSIONS.ORDER_MANAGEMENT.key,
    MODULES_PERMISSIONS.ORDER_MANAGEMENT.permissions.CANCEL_ORDER
  )

  const categories = getApplicableActivities()

  const handleSave = async () => {
    if (newStatus) {
      try {
        setLoading(true)
        const newStep: any = {
          label: newStatus.name,
          status: 'paid',
          id: newStatus.id,
          authorType: session?.user?.role,
          authorName:
            userRole === 'super-admin'
              ? userName
              : pharmacistDetails?.name || userName,
          authorId: userId,
          comment: comment,
          statusCode: newStatus.statusCode,
          orderItemTrackingId: orderTracking._id
        }

        if (newStatus?.statusCode == 'dispatched')
          newStep.packageSize = packageSize

        const res = await updateOnSubmit.mutateAsync({
          _id: orderId,
          storeId: storeId,
          orderItemTrackingId: orderTracking._id,
          data: newStep,
          productBatches: Object.values(statusValidations?.productBatchNo).map(
            e => ({ productId: e.productId, batchNo: e.batchNo })
          )
        })
        setOpenModal(false)
        setNewStatus('')
        setComment('')
        queryClient.invalidateQueries({ queryKey: ['get-order-tracking'] })
        if (onUpdateStatus) onUpdateStatus(res)
      } catch (err) {
        toast({
          title: 'Error',
          description: (err as any)?.response?.data?.message
        })
        console.log('error ==== ', err)
        throw err
      }
      setLoading(false)
    }
  }
  const onContinue = async () => {
    handleSave()
  }
  function getApplicableActivities() {
    const statusMapping: any = {
      order_placed: [
        'order_under_verification',
        'customer_raised_a_concern',
        'canceled'
      ],
      prescription_being_generated: [
        'order_confirmed',
        'customer_raised_a_concern',
        'delivered',
        'canceled'
      ],
      order_under_verification: [
        'order_confirmed',
        'customer_raised_a_concern',
        'delivered',
        'canceled'
      ],
      order_confirmed: [
        'dispatched',
        'customer_raised_a_concern',
        'delivered',
        'canceled'
      ],
      dispatched: ['pickup_rescheduled', 'delivered', 'canceled'],
      pickup_rescheduled: ['pickup_rescheduled', 'delivered', 'canceled'],
      out_for_pickup: ['delivered'],
      picked_up: ['delivered', 'canceled'],
      shipment_booked: [],
      shipped: ['delivered', 'customer_raised_a_concern', 'canceled'],
      out_for_delivery: ['delivered'],
      delivered: ['return_to_origin'],
      return_to_origin: [
        'return_approved',
        'return_declined',
        'delivered',
        'canceled'
      ],
      return_approved: ['refund_initiated'],
      refund_initiated: ['refund_completed'],
      rto_delivered: ['canceled', 'delivered'],
      canceled: ['refund_initiated', 'delivered', 'canceled'],
      return_declined: ['return_approved'],
      prescription_not_clear: ['canceled'],
      prescription_not_available: ['canceled'],
      prescription_declined: ['canceled'],
      prescription_approved: [
        'order_confirmed',
        'customer_raised_a_concern',
        'canceled',
        'delivered'
      ],
      customer_raised_a_concern: ['order_under_verification', 'canceled'],
      order_transferred_to_another_shop: [
        'order_confirmed',
        'customer_raised_a_concern',
        'canceled',
        'delivered'
      ],
      in_transit: ['canceled', 'delivered'],
      logistics_cancelled: ['canceled', 'delivered'],
      prescription_generated: ['canceled', 'delivered'],
      manifested: ['canceled', 'delivered'],
      delivery_pending: ['canceled', 'delivered'],
      skip_logistic: [
        'dispatched',
        'customer_raised_a_concern',
        'delivered',
        'canceled'
      ],
      unskip_logistic: [
        'dispatched',
        'customer_raised_a_concern',
        'delivered',
        'canceled'
      ]
    }

    // Remove 'canceled' from all status mappings if user doesn't have permission
    if (!hasCancelOrderPermission) {
      Object.keys(statusMapping).forEach(key => {
        statusMapping[key] = statusMapping[key].filter(
          (status: string) => status !== 'canceled'
        )
      })
    }

    // Enable Refund for reurn order which is delivered
    if (response?.type === 'return')
      statusMapping.delivered.push('refund_initiated')

    let filteredData = []
    const lastTimelineStatus = response?.lastTimelineStatus
    if (!lastTimelineStatus) {
      filteredData = response?.categoryItemsArray?.filter(
        (ci: any) => ci.statusCode === 'order_placed'
      )
    } else if (lastTimelineStatus && statusMapping[lastTimelineStatus]) {
      filteredData = filterByStatusCode(
        response?.categoryItemsArray,
        statusMapping[lastTimelineStatus]
        // allStatuses
      )
    }
    return filteredData?.filter((s: any) => {
      if (userRole === 'store-admin' && s.statusCode === 'delivered')
        return false
      // Exclude 'canceled' if user doesn't have permission
      if (!hasCancelOrderPermission && s.statusCode === 'canceled') return false
      return true
    })
  }

  const isPrescriptionValidationRequired = () => {
    return (
      prescriptionRequired &&
      orderTracking.type === 'order' &&
      !response?.timelineArray?.filter((a: any) =>
        ['prescription_approved'].includes(a.statusCode)
      )?.length
    )
  }

  const isDisableSaveButton = () => {
    if (checkValidations() || Object.keys(newStatus).length === 0) return true

    return false
  }

  const checkValidations = () => {
    if (newStatus?.statusCode === 'dispatched') {
      console.log(
        'check: ',
        statusValidations,
        Object.keys(statusValidations?.productBatchNo).length,
        orderTracking.items.filter(
          (i: any) => !i.isCancelRequested && !i.isReturnRequested
        ).length
      )

      if (
        orderTracking.items.filter(
          (i: any) => !i.isCancelRequested && !i.isReturnRequested
        ).length !== Object.keys(statusValidations?.productBatchNo).length
      ) {
        return 'Select batch no for all products first'
      }
    }
  }

  const handleSyncOrderTimeline = async () => {
    try {
      await syncOrderTimeline({
        orderId,
        awbNo: orderTracking?.awbNo,
        orderTrackingId: orderTracking?._id
      })

      if (refreshOrder) refreshOrder()
    } catch (e) {
      console.log(e)
      toast({
        title: 'Error',
        description: (e as any)?.response?.data?.message
      })
    }
  }

  const isAlreadyDispatched = (response?.timelineArray ?? []).find(
    (o: any) => o.statusCode === 'dispatched'
  )

  useEffect(() => {
    if (!openModal) setLoading(false)
  }, [openModal])

  const hasDispatchedStatus = orderTracking?.timeline?.some(
    (t: any) => t?.statusCode === 'dispatched'
  )

  if (isPending)
    return <div className='min-h-96 p-3 text-sm text-label'>Loading...</div>

  return (
    <div className='w-full'>
      <div className='w-full grow p-4'>
        {/* <div className='relative flex flex-row justify-between'>
          <div>
            {response.timelineArray.map((step: any, index: number) => (
              <ProgressStepper
                status={step.status}
                label={step.label}
                key={index}
                comment={step.comment}
                date={dayjs(step.date).format(process.env.DATE_TIME_FORMAT)}
                author={step.authorName}
                hasLastNode={index === response.timelineArray?.length - 1}
                transferredByStore={step.previousStoreName}
                userType={step.userType}
              >
                <Check color='#ee6723' size={18} />
              </ProgressStepper>
            ))}
          </div>
        </div> */}

        <div>
          <section className=''>
            <div className='container mx-auto max-w-5xl'>
              <div className='grid grid-cols-12 gap-4'>
                <div className='relative col-span-12 space-y-6 px-4'>
                  <div className='relative col-span-12 space-y-8 px-4 before:bg-gray-300 sm:col-span-8 sm:space-y-6 sm:before:absolute sm:before:-left-3 sm:before:bottom-0 sm:before:top-2 sm:before:w-0.5'>
                    {response?.timelineArray.map((step: any, index: number) => {
                      const UserTypeIcon =
                        step?.authorType === 'user'
                          ? UserIcon
                          : step?.authorType === 'store-admin'
                            ? StoreIcon
                            : step?.authorType === 'logistics'
                              ? TruckIcon
                              : Shield

                      return (
                        <div
                          key={index}
                          className='flex flex-col before:bg-primary sm:relative sm:before:absolute sm:before:left-[-35px] sm:before:top-2 sm:before:z-[1] sm:before:h-4 sm:before:w-4 sm:before:rounded-full'
                        >
                          <h3 className='text-sm font-semibold tracking-wide'>
                            {step?.label}
                          </h3>
                          <time className='text-xs uppercase tracking-wide text-gray-400'>
                            {moment(step?.date).format('DD MMM YYYY HH:mm A')}
                          </time>
                          <time className='mt-2 flex items-center gap-1 text-xs uppercase tracking-wide text-gray-400'>
                            <span>
                              <UserTypeIcon
                                size={16}
                                className='text-primary'
                              />
                            </span>
                            {step?.authorName}
                          </time>
                          <p className='mt-2 text-xs'>{step?.comment}</p>
                          {step?.authorType == 'logistics' &&
                            step?.statusLocation && (
                              <p className='flex gap-1 text-xs text-gray-400'>
                                <MapPinIcon
                                  className='text-primary'
                                  size={16}
                                />
                                {step?.statusLocation}
                              </p>
                            )}

                          {step?.authorType == 'logistics' &&
                            step?.instructions && (
                              <p className='flex gap-1 pl-5 pt-1 text-xs text-gray-400'>
                                {step?.instructions}
                              </p>
                            )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className='mt-6 flex w-full items-center gap-3'>
          {/* Dialog Button */}
          <Dialog open={openModal}>
            <DialogTrigger
              className='flex w-full items-center gap-4'
              disabled={
                isPrescriptionValidationRequired() ||
                disabled ||
                disableStatusChange
              }
            >
              {!disableStatusChange &&
              !disabled &&
              !(isStoreAdmin && hasDispatchedStatus)&&
              !isPrescriptionValidationRequired() ? (
                <div
                  onClick={() => setOpenModal(true)}
                  className={`flex w-full items-center justify-center rounded-md border border-primary px-3 py-2 text-primary hover:bg-primary hover:text-white`}
                >
                  <Plus size={20} />{' '}
                  <p className='ml-2 text-sm font-semibold'>Add New Status</p>
                </div>
              ) : (
                <></>
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Status</DialogTitle>
              </DialogHeader>

              {/* Status Select */}
              <div className='mb-4 w-full'>
                <label className='mb-2 block font-medium text-black'>
                  Select Status
                </label>
                <Select
                  onValueChange={(selectedId: any) => {
                    setErrorMessage('')
                    const selectedStatus: any = categories.find(
                      (status: any) => status._id === selectedId
                    )

                    if (selectedStatus) {
                      setNewStatus({
                        id: selectedStatus._id,
                        name: selectedStatus.name,
                        statusCode: selectedStatus.statusCode
                      })
                    }
                    const error = checkValidations()
                    if (error) setErrorMessage(error)
                  }}
                  value={newStatus?.id}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select Status' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((status: any) => (
                      <SelectItem key={status._id} value={status._id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* {JSON.stringify(newStatus)} */}
              {newStatus?.statusCode == 'dispatched' ? (
                <div className='my-3'>
                  <h1>Select Package Size</h1>
                  <div className='mt-3 flex items-center gap-4'>
                    <div
                      onClick={() => setPackageSize('small')}
                      className={`w-[50%] cursor-pointer rounded-lg border ${packageSize == 'small' ? 'border-[#EE6723]' : 'border-[#E2E1E5]'} p-4`}
                    >
                      <div className='flex w-[50%] justify-between'>
                        <div></div>
                        <div className='flex flex-col items-center justify-center'>
                          <Image
                            src={'/images/box.svg'}
                            alt=''
                            width={24}
                            height={24}
                          />
                          <h1 className='font-bold'>Small</h1>
                        </div>
                      </div>
                      <div className='grid grid-cols-2'>
                        <div className='text-sm'>Dimension:</div>
                        <div className='text-sm'>10 X 40</div>
                        <div className='text-sm'>Weight:</div>
                        <div className='text-sm'>Below 500 Gm</div>
                      </div>
                    </div>
                    <div
                      onClick={() => setPackageSize('big')}
                      className={`w-[50%] cursor-pointer rounded-lg border ${packageSize == 'big' ? 'border-[#EE6723]' : 'border-[#E2E1E5]'} p-4`}
                    >
                      <div className='flex w-[50%] justify-between'>
                        <div></div>
                        <div className='flex flex-col items-center justify-center'>
                          <Image
                            src={'/images/box.svg'}
                            alt=''
                            width={24}
                            height={24}
                          />
                          <h1 className='font-bold'>Big</h1>
                        </div>
                      </div>
                      <div className='grid grid-cols-2'>
                        <div className='text-sm'>Dimension:</div>
                        <div className='text-sm'>16 X 20</div>
                        <div className='text-sm'>Weight:</div>
                        <div className='text-sm'>500 Gm - 2 Kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Comment Textarea */}
              <div className='mb-4'>
                <label className='mb-2 block'>Comment</label>
                <Textarea
                  style={{ resize: 'none' }}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder='Add your comment'
                  rows={4}
                />
              </div>

              {/* Save and Cancel Buttons */}
              <div className='flex justify-end space-x-2'>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setOpenModal(false)
                    setNewStatus('')
                    setComment('')
                    setErrorMessage('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setOpen(true)}
                  disabled={isDisableSaveButton() || loading}
                  className={'flex items-center gap-3'}
                >
                  {loading && <Spinner height={28} width={28} />}
                  <div>Save</div>
                </Button>
              </div>
              {errorMessage && (
                <div className={'text-sm text-red-500'}>{errorMessage}</div>
              )}
            </DialogContent>
          </Dialog>

          {orderTracking && orderTracking?.awbNo && (
            <div>
              <Button
                variant={'outline'}
                size={'sm'}
                className='flex gap-1 text-primary'
                onClick={() => handleSyncOrderTimeline()}
              >
                <RefreshCcwIcon size={20} />
                Refresh
              </Button>
            </div>
          )}
        </div>

        {orderTracking?.type === 'order' &&
          !isAlreadyDispatched &&
          isSuperAdmin && (
            <div className='w-full pt-4'>
              <SkipLogisticsDialog
                orderId={orderId}
                orderTrackingId={orderTracking?._id}
                skipLogistics={order?.skipLogistics ?? false}
                onSuccess={() => refreshOrder && refreshOrder()}
              />
            </div>
          )}

        <AlertBox
          openState={[open, setOpen]}
          content={'Are you sure you want to add this track order status?'}
          onContinue={onContinue}
        />
      </div>
    </div>
  )
}

export default TrackOrders
