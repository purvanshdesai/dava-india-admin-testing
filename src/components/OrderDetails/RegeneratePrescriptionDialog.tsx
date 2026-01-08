'use client'

import * as React from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCreateTicketForOrder } from '@/utils/hooks/orderHooks'
import { useToast } from '@/hooks/use-toast'
import { fetchSlotsWithDate } from '@/utils/actions/slotsActions'
import { addDays, startOfDay, isBefore, isAfter } from 'date-fns'
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent
// } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Loader2 } from 'lucide-react'

const timeSlots = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
  '01:00 PM - 01:30 PM',
  '01:30 PM - 02:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
  '05:00 PM - 05:30 PM',
  '05:30 PM - 06:00 PM',
  '06:00 PM - 06:30 PM',
  '06:30 PM - 07:00 PM',
  '07:00 PM - 07:30 PM',
  '07:30 PM - 08:00 PM'
]

export function RegeneratePrescriptionDialog(orderIdProp: any) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)

  const { mutateAsync: createTicket } = useCreateTicketForOrder()

  // Ensure orderId is always a string
  const orderId =
    typeof orderIdProp === 'string'
      ? orderIdProp
      : orderIdProp?.orderId || orderIdProp?._id || ''

  // Slot selection state
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = React.useState('')
  const [availableSlots, setAvailableSlots] = React.useState<any[]>([])
  const [slotsLoading, setSlotsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Only allow today's date
  const today = startOfDay(new Date())
  const allowedDate = today

  // Auto-select date on mount
  React.useEffect(() => {
    if (!selectedDate) {
      const autoSelectDate = async () => {
        setSelectedDate(allowedDate)
        await handleDateChange(allowedDate, true)
      }
      autoSelectDate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDateChange = async (date: any, isAutoSelect = false) => {
    if (!isAutoSelect) {
      setSelectedDate(date)
      setSelectedTime('')
      setError('')
    }
    if (date) {
      setSlotsLoading(true)
      const res = await fetchSlotsWithDate(date.toISOString())
      const slots = Array.isArray(res) ? res : []
      setAvailableSlots(slots)

      // Check if all slots are closed
      const availableSlotSetForCheck = new Set(
        slots?.map((slot: any) => {
          const start = convertTo12Hour(slot.startTime)
          const end = convertTo12Hour(slot.endTime)
          return `${start} - ${end}`
        }) ?? []
      )

      const today = startOfDay(new Date())
      const isToday = startOfDay(date).getTime() === today.getTime()
      let allSlotsClosed = true

      for (const slot of timeSlots) {
        const isAvailable = availableSlotSetForCheck.has(slot)
        const slotStartTime = slot.split(' - ')[0]
        let isPast = false

        if (isToday) {
          const now = new Date()
          const [hourStr, minuteStr, meridiem] = slotStartTime?.split(/[:\s]/)
          let hour = parseInt(hourStr, 10)
          const minute = parseInt(minuteStr, 10)

          if (meridiem === 'PM' && hour !== 12) hour += 12
          if (meridiem === 'AM' && hour === 12) hour = 0

          const slotTime = new Date(date)
          slotTime.setHours(hour, minute, 0, 0)
          isPast = now > slotTime
        }

        if (isAvailable && !isPast) {
          allSlotsClosed = false
          break
        }
      }

      // If all slots are closed, automatically try next date
      if (allSlotsClosed && !isAutoSelect) {
        const nextDate = addDays(date, 1)
        setSelectedDate(nextDate)
        await handleDateChange(nextDate, true)
      }
      setSlotsLoading(false)
    } else {
      setAvailableSlots([])
    }
  }

  // Helper to convert "13:30" to "01:30 PM"
  function convertTo12Hour(time24: string): string {
    const [hourStr, minuteStr] = time24.split(':')
    const hour = parseInt(hourStr, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return `${hour12.toString().padStart(2, '0')}:${minuteStr} ${period}`
  }

  // Convert start/end time pairs to labels matching timeSlots format
  const availableSlotSet = new Set(
    availableSlots?.map((slot: any) => {
      const start = convertTo12Hour(slot.startTime)
      const end = convertTo12Hour(slot.endTime)
      return `${start} - ${end}`
    }) ?? []
  )

  const handleProceed = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select date and time slot')
      return
    }
    try {
      await createTicket({
        orderId,
        dateOfConsult: selectedDate,
        timeOfConsult: selectedTime
      })
      setOpen(false)
      toast({
        title: 'Success',
        description: 'Ticket created successfully'
      })
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: (error as any)?.response?.data?.message
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-full'>
          Regenerate Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className='h-[700px]'>
        <DialogHeader>
          <DialogTitle>Regenerate Prescription</DialogTitle>
          <DialogDescription>
            Select a slot for the prescription call. Only today (before 8pm) or
            tomorrow (after 8pm) is allowed.
          </DialogDescription>
        </DialogHeader>
        <div className='flex w-full flex-col items-center gap-3 overflow-auto py-2'>
          <label className='text-xs font-medium'>Select Date</label>
          <Calendar
            mode='single'
            showOutsideDays={false}
            selected={selectedDate}
            onSelect={(date: any) => handleDateChange(date)}
            className='rounded-md border'
            disabled={(date: Date) => {
              const dateStart = startOfDay(date)
              const allowedDateStart = startOfDay(allowedDate)
              return isBefore(dateStart, allowedDateStart) || isAfter(dateStart, allowedDateStart)
            }}
          />
          <label className='text-xs font-medium'>Select Time Slot</label>
          {slotsLoading ? (
            <div className='flex h-20 items-center justify-center'>
              <Loader2 className='animate-spin text-[#FA582D]' size={24} />
              <span className='ml-2 text-sm text-gray-500'>Loading...</span>
            </div>
          ) : (
            <div className='grid grid-cols-3 gap-2'>
              {timeSlots
                .filter((slot: any) => {
                  const isAvailable = availableSlotSet.has(slot)
                  const slotStartTime = slot.split(' - ')[0]
                  let isPast = false

                  if (selectedDate) {
                    const today = startOfDay(new Date())
                    const isToday =
                      startOfDay(selectedDate).getTime() === today.getTime()

                    if (isToday) {
                      const now = new Date()
                      const [hourStr, minuteStr, meridiem] =
                        slotStartTime?.split(/[:\s]/)
                      let hour = parseInt(hourStr, 10)
                      const minute = parseInt(minuteStr, 10)

                      if (meridiem === 'PM' && hour !== 12) hour += 12
                      if (meridiem === 'AM' && hour === 12) hour = 0

                      const slotTime = new Date(selectedDate)
                      slotTime.setHours(hour, minute, 0, 0)
                      isPast = now > slotTime
                    }
                  }

                  // Only show available and non-past slots
                  return isAvailable && !isPast
                })
                .map((slot: any) => {
                  return (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedTime(slot)
                      }}
                      className={`h-7 px-2 py-1 text-[10px] ${
                        selectedTime === slot
                          ? 'bg-[#FA582D] text-white'
                          : 'border text-gray-700'
                      }`}
                    >
                      {slot}
                    </Button>
                  )
                })}
            </div>
          )}
          {error && <div className='text-xs text-red-500'>{error}</div>}
        </div>
        <DialogFooter className='flex justify-end gap-2'>
          <Button variant='secondary' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={e => {
              e.preventDefault()
              handleProceed()
            }}
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
