import {
  Calendar as CalendarIcon,
  Copy,
  Link2,
  Mail,
  // MapPinHouse,
  MessageCircleMore,
  Smartphone,
  Pencil,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import React, { useState, useEffect } from 'react'
import ActivityTab from '@/components/inquiry/ticket-details/ActivityTab'
import AttachmentsTab from '@/components/inquiry/ticket-details/AttachmentsTab'
import dayjs from 'dayjs'
import { useToast } from '@/hooks/use-toast'
import { useAddActivity, usePatchTicket } from '@/utils/hooks/ticketHooks'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import AssignDialog from '@/components/inquiry/ticket-details/AssignDialog'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import TicketTabs from '@/components/inquiry/ticket-details/TicketTabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function TicketDetails({ ticketDetails }: any) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { mutateAsync: patchTicketDataAsync, isPending } = usePatchTicket()
  const { mutateAsync } = useAddActivity()
  const [currentTab, setCurrentTab] = useState('activity')
  const [isOpen, setIsOpen] = useState(false)
  const [isEditingDOB, setIsEditingDOB] = useState(false)
  const [editedDOB, setEditedDOB] = useState<Date | undefined>(undefined)

  useEffect(() => {
    // Add custom styles for date picker dropdowns
    const style = document.createElement('style')
    style.textContent = `
      .react-datepicker__year-dropdown {
        max-height: 200px !important;
        overflow-y: auto !important;
      }
      .react-datepicker__month-dropdown {
        max-height: 200px !important;
        overflow-y: auto !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      // Cleanup: remove the style when component unmounts
      document.head.removeChild(style)
    }
  }, [])

  const tabs = [
    {
      name: 'Conversations',
      value: 'conversations',
      icon: <MessageCircleMore color={'#EE6723'} />,
      content: <div className='p-3'>Conversations Tab Content</div>
    },
    {
      name: 'Attachments',
      value: 'attachments',
      icon: <Link2 color={'#EE6723'} />,
      content: <AttachmentsTab ticketDetails={ticketDetails} />
    },
    {
      name: 'Activity',
      value: 'activity',
      icon: <MessageCircleMore color={'#EE6723'} />,
      content: <ActivityTab ticketDetails={ticketDetails} />
    }
  ]

  const copyToClipboard = (entity: string, text: string) => {
    if (!text) return

    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Text copied to clipboard!')
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
      })
    toast({ title: 'Copied', description: `${entity} copied to clipboard` })
  }

  const updateTicketData = async (updatedData: any) => {
    await patchTicketDataAsync({ _id: ticketDetails._id, ...updatedData })
    queryClient.invalidateQueries({ queryKey: ['fetch-ticket-details'] })
    // setValues((prev: any) => ({ ...prev, ...updatedData }))
  }

  const setDueDate = async (date: Date) => {
    await mutateAsync({
      ticketId: ticketDetails._id,
      activity: 'due-date-changed',
      content: date.toISOString()
    })
    queryClient.invalidateQueries({ queryKey: ['fetch-ticket-details'] })
  }

  const getIssueLabel = (issue: string) => {
    const issueLabels: any = {
      'order-not-delivered': 'Order not delivered',
      'late-delivery': 'Late delivery',
      'wrong-medicine-delivered': 'Wrong medicine delivered',
      'order-cancellation-request': 'Order cancellation request',
      'lost-or-missing-item-in-delivery': 'Lost or missing item in delivery',
      'prescription-upload': 'Prescription upload',
      'doctor-consultation': 'Doctor consultation'
    }
    return issueLabels[issue]
  }

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    const dob = new Date(dateOfBirth)
    const now = new Date()

    let age = now.getFullYear() - dob.getFullYear()
    const hasHadBirthdayThisYear =
      now.getMonth() > dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate())

    if (!hasHadBirthdayThisYear) {
      age--
    }

    return age
  }

  const handleSaveDOB = async () => {
    if (editedDOB) {
      await updateTicketData({ editedDateOfBirth: editedDOB.toISOString() })
      setIsEditingDOB(false)
      toast({
        title: 'Success',
        description: 'Date of birth updated successfully'
      })
    }
  }

  const handleCancelDOB = () => {
    setEditedDOB(undefined)
    setIsEditingDOB(false)
  }

  const getDOBForAge = () => {
    return (
      ticketDetails?.editedDateOfBirth || ticketDetails?.patientId?.dateOfBirth
    )
  }

  if (isPending) return <div>Loading...</div>

  return (
    <div className={'h-full'}>
      <div
        className={'mt-3 grid grid-cols-[1fr_2fr_1fr] gap-3'}
        style={{ height: 'calc(100vh - 86px)' }}
      >
        <div className={'flex flex-col rounded-md border'}>
          <div>
            <div className='bg-[#F9FBFD] p-3 text-sm font-bold'>Issue</div>
            <div className={'flex h-32 p-3 text-sm'}>
              {ticketDetails?.comment}
            </div>
          </div>

          <div>
            <div className='bg-[#F9FBFD] p-3 text-sm font-bold'>
              Issue Raised By
            </div>

            <div className={'flex flex-col gap-2 p-3 text-sm'}>
              <div className={'font-semibold'}>
                {ticketDetails?.createdBy?.name ||
                  ticketDetails?.createdBy?.fullName}
              </div>
              <div className={'flex items-center gap-3'}>
                <Mail color={'#E75634'} size={18} />
                <div>{ticketDetails?.createdBy?.email}</div>
                <Copy
                  className={'cursor-pointer'}
                  color={'#222222'}
                  size={18}
                  onClick={() =>
                    copyToClipboard('Email', ticketDetails?.createdBy?.email)
                  }
                />
              </div>
              <div className={'flex items-center gap-3'}>
                <Smartphone color={'#E75634'} size={18} />
                <div>{ticketDetails?.phoneNumber}</div>
                <Copy
                  className={'cursor-pointer'}
                  color={'#222222'}
                  size={18}
                  onClick={() =>
                    copyToClipboard(
                      'Phone No',
                      ticketDetails?.createdBy?.phoneNumber
                    )
                  }
                />
              </div>
              {/* {ticketDetails?.consultation?.address && (
                <div className={'flex gap-3'}>
                  <MapPinHouse color={'#E75634'} size={18} />
                  <div className='flex flex-col'>
                    <span>
                      Name: {ticketDetails?.consultation?.address?.userName}
                    </span>
                    <span>
                      Address:
                      {ticketDetails?.consultation?.address?.addressLine1}
                    </span>
                    <span>
                      {ticketDetails?.consultation?.address?.addressLine2}
                    </span>
                    <span>
                      City: {ticketDetails?.consultation?.address?.city}
                    </span>
                    <span>
                      State: {ticketDetails?.consultation?.address?.state}
                    </span>
                    <span>
                      Pincode:
                      {ticketDetails?.consultation?.address?.postalCode}
                    </span>
                    <span>
                      Phone: {ticketDetails?.consultation?.address?.phoneNumber}
                    </span>
                  </div>
                </div>
              )} */}
              <div className={'flex gap-2'}>
                <div className={'font-semibold'}>Issue:</div>
                <div>{getIssueLabel(ticketDetails.issue)}</div>
              </div>
            </div>
          </div>
          {ticketDetails?.patientId && (
            <div>
              <div className='bg-[#F9FBFD] p-3 text-sm font-bold'>
                Patient Details
              </div>

              <div className={'flex flex-col gap-2 p-3 text-sm'}>
                <div className={'font-semibold'}>
                  Patient Name : {ticketDetails?.patientId?.name}
                </div>
                <div className={'font-semibold'}>
                  Relation : {ticketDetails?.patientId?.relation}
                </div>
                <div className={'font-semibold'}>
                  Patient Gender : {ticketDetails?.patientId?.gender}
                </div>
                <div className={'flex items-center gap-2'}>
                  <div className={'font-semibold'}>
                    Patient Age : {calculateAge(getDOBForAge())}
                  </div>
                  {ticketDetails?.issue === 'doctor-consultation' && (
                    <>
                      {!isEditingDOB ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={() => {
                            setEditedDOB(
                              ticketDetails?.editedDateOfBirth
                                ? new Date(ticketDetails.editedDateOfBirth)
                                : ticketDetails?.patientId?.dateOfBirth
                                  ? new Date(
                                      ticketDetails.patientId.dateOfBirth
                                    )
                                  : undefined
                            )
                            setIsEditingDOB(true)
                          }}
                        >
                          <Pencil className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex items-center gap-1'>
                          <DatePicker
                            selected={editedDOB}
                            onChange={(date: Date | null) =>
                              setEditedDOB(date || undefined)
                            }
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode='select'
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                            dateFormat='dd/MM/yyyy'
                            maxDate={new Date()}
                            minDate={new Date(1900, 0, 1)}
                            className='border-input bg-background h-6 rounded border px-2 text-xs'
                            wrapperClassName='inline-block'
                            calendarClassName='text-xs'
                            placeholderText='Select DOB'
                          />
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0 text-green-600'
                            onClick={handleSaveDOB}
                          >
                            <Check className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0 text-red-600'
                            onClick={handleCancelDOB}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className={'flex items-center gap-3'}>
                  <Mail color={'#E75634'} size={18} />
                  <div>{ticketDetails?.patientId?.email}</div>
                  <Copy
                    className={'cursor-pointer'}
                    color={'#222222'}
                    size={18}
                    onClick={() =>
                      copyToClipboard('Email', ticketDetails?.patientId?.email)
                    }
                  />
                </div>
                <div className={'flex items-center gap-3'}>
                  <Smartphone color={'#E75634'} size={18} />
                  <div>{ticketDetails?.patientId?.phoneNumber}</div>
                  <Copy
                    className={'cursor-pointer'}
                    color={'#222222'}
                    size={18}
                    onClick={() =>
                      copyToClipboard(
                        'Phone No',
                        ticketDetails?.patientId?.phoneNumber
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {ticketDetails?.order?._id && (
            <div>
              <div className='bg-[#F9FBFD] p-3 text-sm font-bold'>
                Order Details
              </div>

              <div className={'flex flex-col p-3 text-sm'}>
                <div className={'grid grid-cols-3 space-y-2'}>
                  <div className={'mt-2 font-semibold'}>Order No :</div>
                  <div className={'col-span-2 text-violet-500'}>
                    <Link href={`/orders/${ticketDetails?.order?._id}`}>
                      {ticketDetails?.order?.orderId}
                    </Link>
                  </div>
                  <div className={'font-semibold'}>Order Date :</div>
                  <div className={'col-span-2'}>
                    {dayjs(ticketDetails?.order?.cretedAt).format(
                      process.env.DATE_TIME_FORMAT
                    )}
                  </div>
                  {/*<div className={'font-semibold'}>Order Status :</div>*/}
                  {/*<div className={'col-span-2'}>Order under verification</div>*/}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={'flex w-full flex-col rounded-md border'}>
          <div className={'flex-grow'}>
            <TicketTabs
              defaultValue={'activity'}
              on
              tabs={tabs}
              value={currentTab}
              onValueChange={(tab: string) => setCurrentTab(tab)}
            />
          </div>
        </div>

        <div className='flex w-full flex-col rounded-md border'>
          <div className='bg-[#F9FBFD] p-3 text-sm font-bold'>Assigned To</div>
          <div className={'flex flex-col gap-4 p-3 text-sm'}>
            <div>{ticketDetails?.assignee?.name}</div>

            <div className={'flex items-center justify-between'}>
              <div className='w-full'>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className={'w-full text-primary'}
                      variant={'outline'}
                      size={'sm'}
                    >
                      Re Assign
                    </Button>
                  </DialogTrigger>
                  <AssignDialog
                    ticketId={ticketDetails?._id}
                    dialogState={[isOpen, setIsOpen]}
                  />
                </Dialog>
              </div>
            </div>
          </div>
          {ticketDetails?.dateOfConsult && (
            <div className='text-sm'>
              <div className='bg-[#F9FBFD] p-3 text-sm font-bold'>
                Consultation Date & Time
              </div>
              <div className='flex flex-col gap-4 py-4'>
                <div className={'pl-4 text-xs font-semibold'}>
                  Date :
                  {dayjs(ticketDetails?.dateOfConsult).format('DD-MM-YYYY')}
                </div>
                <div className={'pl-4 text-xs font-semibold'}>
                  Time Slot : {ticketDetails?.timeOfConsult}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className='bg-[#F9FBFD] p-3 text-sm font-bold'>Due Date</div>

            <div className={'flex items-center gap-3 p-3 text-sm'}>
              <div className='flex-1'>
                <Popover>
                  <PopoverTrigger className='dark:border-gray-900' asChild>
                    <Button
                      variant={'datepicker'}
                      className={cn(
                        'w-full justify-start text-left font-normal dark:bg-black dark:text-gray-300'
                      )}
                    >
                      {format(ticketDetails?.dueDate, 'PPP')}
                      <CalendarIcon className='ml-auto h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={new Date(ticketDetails?.dueDate)}
                      // onSelect={date => field.onChange(date)}
                      onSelect={(date: Date | undefined) => {
                        if (date) setDueDate(date)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div>
            <div className='bg-[#F9FBFD] p-3 text-sm font-bold'>Status</div>

            <div className={'flex items-center gap-3 p-3 text-sm'}>
              <div className='flex-1'>
                <Select
                  value={ticketDetails?.status}
                  onValueChange={(value: string) =>
                    updateTicketData({ status: value })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value='open'>Open</SelectItem>
                      <SelectItem value='reopen'>Re-Open</SelectItem>
                      <SelectItem value='closed'>Closed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
