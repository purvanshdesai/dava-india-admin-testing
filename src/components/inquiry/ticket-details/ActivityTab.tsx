import dayjs from 'dayjs'
import { Input } from '@/components/ui/input'
import { Loader2, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { uploadFiles } from '@/utils/utils/fileUpload'
import { useAddActivity } from '@/utils/hooks/ticketHooks'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import ViewPrescription from '@/components/OrderDetails/ViewPrescription'

export default function ActivityTab({ ticketDetails }: { ticketDetails: any }) {
  // const activities = [
  //   {
  //     createdBy: {
  //       _id: '12345',
  //       name: 'John Wick'
  //     },
  //     activity: 'ticket-created',
  //     status: 'Order Dispatched',
  //     createdAt: new Date().toISOString()
  //   },
  //   {
  //     createdBy: {
  //       _id: '12345',
  //       name: 'John Wick'
  //     },
  //     activity: 'status-changed',
  //     status: 'Order Dispatched',
  //     createdAt: new Date().toISOString()
  //   }
  // ]
  const router = useRouter()
  const { mutateAsync } = useAddActivity()
  const queryClient = useQueryClient()

  const fileInputRef = useRef(null)

  const isOrderCreated = ticketDetails?.activities?.find(
    (item: any) => item?.activity == 'order-created'
  )

  const [note, setNote] = useState<string>('')

  const handleFileChange = async (event: any) => {
    const files = event.target.files // Get the selected files
    if (files.length > 0) {
      console.log('Selected file:', files[0])
      const uploadedFiles = await uploadFiles(Array.from(files))
      await mutateAsync({
        ticketId: ticketDetails._id,
        activity: 'attachment-added',
        attachments: uploadedFiles
      })
      queryClient.invalidateQueries({ queryKey: ['fetch-ticket-details'] })
    }
  }

  const saveNote = async () => {
    if (!note) return

    await mutateAsync({
      ticketId: ticketDetails._id,
      activity: 'note-added',
      content: note
    })
    setNote('')
    queryClient.invalidateQueries({ queryKey: ['fetch-ticket-details'] })
  }

  const getStatus = (activity: any) => {
    switch (activity.activity) {
      case 'ticket-created':
        return <div className={'text-sm text-label'}>Raised a ticket</div>
      case 'status-updated':
        return (
          <div className={'text-sm text-label'}>
            Changed the status to{' '}
            <span className={'text-red font-semibold'}>{activity.status}</span>
          </div>
        )
      case 'attachment-added':
        return (
          <div className={'text-sm text-label'}>
            Added an attachment{' '}
            <span className={'font-semibold'}>
              {activity.attachments
                .map((a: any) => a?.objectDetails?.originalFileName)
                .join(', ')}
            </span>
          </div>
        )
      case 'attachment-removed':
        return (
          <div className={'text-sm text-label'}>
            Removed attachment{' '}
            <span className={'font-semibold'}>
              {activity.attachments
                .map((a: any) => a?.objectDetails?.originalFileName)
                .join(', ')}
            </span>
            {}
          </div>
        )
      case 'assignee-changed':
        return (
          <div className={'text-sm text-label'}>
            Assigned issue to{' '}
            <span className={'font-semibold'}>
              {activity.content.fullName ?? activity.content.name}
            </span>
          </div>
        )
      case 'note-added':
        return <div className={'text-sm text-label'}>Added note</div>
      case 'due-date-changed':
        return (
          <div className={'text-sm text-label'}>
            Changed due date to{' '}
            <span className={'font-semibold'}>
              {dayjs(activity.content).format(process.env.DATE_FORMAT)}
            </span>
          </div>
        )
      case 'order-created':
        return (
          <div className='flex w-full items-center justify-between'>
            <p>Order created for {ticketDetails?.createdBy?.name}</p>
            {activity?.content ? (
              <Dialog>
                <DialogTrigger>
                  <Button variant='link'>View Prescription</Button>
                </DialogTrigger>
                <ViewPrescription
                  orderId=''
                  status='paid'
                  showActions={false}
                  prescription={activity?.content}
                  handlePrescriptionStatusChange={() => {}}
                />
              </Dialog>
            ) : (
              <div className='flex items-center gap-2'>
                <p className='ml-5'>generating prescription</p>
                <Loader2 className='animate-spin' />
              </div>
            )}
          </div>
        )
      case 'prescription-approved':
        return (
          <div className='flex w-full items-center justify-between'>
            <p>Prescription has been approved</p>
            {activity?.content ? (
              <Dialog>
                <DialogTrigger>
                  <Button variant='link'>View Prescription</Button>
                </DialogTrigger>
                <ViewPrescription
                  orderId=''
                  status='paid'
                  showActions={false}
                  prescription={activity?.content}
                  handlePrescriptionStatusChange={() => {}}
                />
              </Dialog>
            ) : (
              <p className='ml-5'>Prescription being generated</p>
            )}
          </div>
        )
      case 'prescription-rejected':
        return (
          <div className='flex w-full items-center justify-between'>
            <p>Prescription has been rejected</p>
            {activity?.content ? (
              <Dialog>
                <DialogTrigger>
                  <Button variant='link'>View Prescription</Button>
                </DialogTrigger>
                <ViewPrescription
                  orderId=''
                  status='paid'
                  showActions={false}
                  prescription={activity?.content}
                  handlePrescriptionStatusChange={() => {}}
                />
              </Dialog>
            ) : (
              <p className='ml-5'>Prescription being generated</p>
            )}
          </div>
        )
      default:
        return <div> {activity.activity}</div>
    }
  }

  useEffect(() => {
    console.log('load ', ticketDetails)
    // const orderCreatedActivity = ticketDetails?.activities?.find(
    //   (activity: any) => activity.activity == 'order-created'
    // )
    // console.log('load ', orderCreatedActivity)
    // console.log('load ', orderCreatedActivity?.content)
    if (true) {
      setTimeout(() => {
        console.log('load timer')
        queryClient.invalidateQueries({
          queryKey: ['fetch-ticket-details', ticketDetails?._id]
        })
      }, 1000)
    }
  }, [ticketDetails])
  return (
    <div className={'flex flex-col gap-3 bg-gray-100 p-3'}>
      {ticketDetails?.issue == 'doctor-consultation' && !isOrderCreated ? (
        <div
          className={
            'flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white p-3'
          }
        >
          <div className={'flex flex-col'}>
            <div className={'flex items-center gap-2'}>
              <div>
                <span className={'font-semibold'}>
                  {' '}
                  {ticketDetails.createdBy.name}{' '}
                </span>{' '}
                requested for a doctor consultation
              </div>
            </div>
            <div className={'text-sm text-label'}>
              {dayjs(ticketDetails.createdAt).format(
                process.env.DATE_TIME_FORMAT
              )}
            </div>
          </div>
          <div>
            <Button
              type='button'
              onClick={() =>
                router.push(`/inquiries/${ticketDetails?._id}/order`)
              }
            >
              Create Order
            </Button>
          </div>
        </div>
      ) : null}
      {ticketDetails?.issue == 'prescription-upload' && true ? (
        <div
          className={
            'flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white p-3'
          }
        >
          <div className={'flex flex-col'}>
            <div className={'flex items-center gap-2'}>
              <div className={'font-semibold'}>
                {ticketDetails.createdBy.name}
              </div>
              requested for prescription order
            </div>
            <div className={'text-sm text-label'}>
              {dayjs(ticketDetails.createdAt).format(
                process.env.DATE_TIME_FORMAT
              )}
            </div>
          </div>
          <div>
            <Button
              type='button'
              onClick={() =>
                router.push(`/inquiries/${ticketDetails?._id}/prescription`)
              }
            >
              Create Order
            </Button>
          </div>
        </div>
      ) : null}
      {ticketDetails?.activities.map((activity: any, index: number) => (
        <div
          key={index}
          className={
            'flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-3'
          }
        >
          <div
            className={
              'flex h-10 w-10 items-center justify-center rounded-full bg-violet-700 font-semibold text-white'
            }
          >
            {activity.createdBy?.name?.charAt(0) ??
              activity.createdBy?.fullName?.charAt(0)}
          </div>
          <div className={'flex flex-col'}>
            <div className={'flex items-center gap-2'}>
              <div className={'font-semibold'}>
                {activity?.createdBy?.name ?? activity.createdBy?.fullName}
              </div>
              {getStatus(activity)}
            </div>
            {activity.activity === 'note-added' ? (
              <div className={'text-sm'}>{activity.content}</div>
            ) : null}
            <div className={'text-sm text-label'}>
              {dayjs(activity.createdAt).format(process.env.DATE_TIME_FORMAT)}
            </div>
          </div>
        </div>
      ))}
      <div className={'flex items-center gap-2 p-2'}>
        <div className={'flex-grow'}>
          <Input
            className={'w-full'}
            placeholder={'Enter note'}
            value={note}
            onInput={(e: any) => setNote(e.target.value)}
          />
        </div>
        <Button onClick={() => saveNote()}>Save</Button>
        <input
          ref={fileInputRef}
          type={'file'}
          className={'hidden'}
          multiple={true}
          onChange={handleFileChange}
        />
        <Paperclip
          className={'cursor-pointer'}
          onClick={() => (fileInputRef as any)?.current?.click()}
        />
      </div>
    </div>
  )
}
