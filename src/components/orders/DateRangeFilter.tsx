'use client'

import { useEffect, useState } from 'react'
import {
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parse,
  startOfMonth,
  startOfWeek,
  subDays
} from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import {
  ArrowUpWideNarrow,
  CalendarClock,
  CalendarCog,
  CalendarDays,
  CalendarRange,
  ChartNoAxesGantt
} from 'lucide-react'

const OPTIONS = [
  { label: 'All Time', value: 'all', icon: <ArrowUpWideNarrow size={18} /> },
  { label: 'Year', value: 'year', icon: <ChartNoAxesGantt size={18} /> },
  { label: 'Month', value: 'month', icon: <CalendarDays size={18} /> },
  { label: 'Week', value: 'week', icon: <CalendarRange size={18} /> },
  { label: 'Today', value: 'today', icon: <CalendarClock size={18} /> },
  { label: 'Custom', value: 'custom', icon: <CalendarCog size={18} /> }
]

const today = new Date()
const maxSelectableDate = today
const minSelectableDate = subDays(today, 90)

export default function DateRangeFilter({
  value,
  onApply
}: {
  value?: DateRange
  onApply: (range: DateRange | null, option: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState('all')
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    value || { from: today, to: today }
  )
  const [appliedLabel, setAppliedLabel] = useState('All Time')
  const [appliedIcon, setAppliedIcon] = useState(
    <ArrowUpWideNarrow size={18} />
  )

  const clampRange = (from: Date, to: Date): DateRange => ({
    from: isBefore(from, minSelectableDate) ? minSelectableDate : from,
    to: isAfter(to, maxSelectableDate) ? maxSelectableDate : to
  })

  const handlePreset = (value: string) => {
    const label = OPTIONS.find(o => o.value === value)?.label || 'Select Date'
    let range: DateRange | null = null

    switch (value) {
      case 'today':
        range = { from: today, to: today }
        break
      case 'week':
        range = {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 })
        }
        break
      case 'month':
        range = {
          from: startOfMonth(today),
          to: endOfMonth(today)
        }
        break
      case 'year':
        range = {
          from: new Date(today.getFullYear(), 0, 1),
          to: today
        }
        break
      case 'all':
        range = null
        break
    }

    // Update selectedOption first to prevent useEffect from overriding it
    setSelectedOption(value)

    if (range) {
      const clamped: any = clampRange(range.from!, range.to!)
      onApply(clamped, value)
      setAppliedLabel(
        `${label} (${format(clamped.from, 'dd MMM')} - ${format(clamped.to, 'dd MMM')})`
      )
      setAppliedIcon(
        OPTIONS.find(o => o.value === value)?.icon || (
          <ArrowUpWideNarrow size={18} />
        )
      )
    } else {
      onApply(null, value)
      setAppliedLabel(label)
      setAppliedIcon(<ArrowUpWideNarrow size={18} />)
    }

    setOpen(false)
  }

  const handleCalendarChange = (range: DateRange | undefined) => {
    if (
      range?.from &&
      range?.to &&
      !isBefore(range.from, minSelectableDate) &&
      !isAfter(range.to, maxSelectableDate)
    ) {
      setCustomRange(range)
    }
  }

  const handleManualDate = (type: 'from' | 'to', val: string) => {
    const parsed = parse(val, 'yyyy-MM-dd', new Date())
    if (
      !isNaN(parsed.getTime()) &&
      !isBefore(parsed, minSelectableDate) &&
      !isAfter(parsed, maxSelectableDate)
    ) {
      setCustomRange(
        prev =>
          ({
            ...prev,
            [type]: parsed
          }) as DateRange
      )
    }
  }

  useEffect(() => {
    if (!value?.from || !value?.to) {
      setAppliedLabel('All Time')
      setSelectedOption('all')
      setAppliedIcon(<ArrowUpWideNarrow size={18} />)
      return
    }

    const from = value.from
    const to = value.to

    const sameDay = (a: Date, b: Date) =>
      format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd')

    const inRange = (actual: DateRange, expected: DateRange) =>
      sameDay(actual.from!, expected.from!) && sameDay(actual.to!, expected.to!)

    const todayRange = { from: today, to: today }
    const weekRange = clampRange(
      startOfWeek(today, { weekStartsOn: 1 }),
      endOfWeek(today, { weekStartsOn: 1 })
    )
    const monthRange = clampRange(startOfMonth(today), endOfMonth(today))
    const yearRange = clampRange(new Date(today.getFullYear(), 0, 1), today)

    const actualRange = { from, to }

    // Check in order: today, month, week, year (month before week to avoid false matches)
    if (inRange(actualRange, todayRange)) {
      setAppliedLabel('Today')
      setSelectedOption('today')
      setAppliedIcon(<CalendarClock size={18} />)
    } else if (inRange(actualRange, monthRange)) {
      setAppliedLabel('Month')
      setSelectedOption('month')
      setAppliedIcon(<CalendarDays size={18} />)
    } else if (inRange(actualRange, weekRange)) {
      setAppliedLabel('Week')
      setSelectedOption('week')
      setAppliedIcon(<CalendarRange size={18} />)
    } else if (inRange(actualRange, yearRange)) {
      setAppliedLabel('Year')
      setSelectedOption('year')
      setAppliedIcon(<ChartNoAxesGantt size={18} />)
    } else {
      setAppliedLabel(
        `Custom (${format(from, 'dd/MM/yyyy')} - ${format(to, 'dd/MM/yyyy')})`
      )
      setSelectedOption('custom')
      setAppliedIcon(<CalendarCog size={18} />)
    }

    setCustomRange({ from, to })
  }, [value])

  const handleSave = () => {
    if (customRange?.from && customRange?.to) {
      const clamped: any = clampRange(customRange.from, customRange.to)
      onApply(clamped, selectedOption)
      setAppliedLabel(
        `Custom (${format(clamped.from, 'dd/MM/yyyy')} - ${format(clamped.to, 'dd/MM/yyyy')})`
      )
      setAppliedIcon(<CalendarCog size={18} />)
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setSelectedOption('all')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='flex max-w-[360px] items-center justify-start gap-3 text-left font-normal'
        >
          {appliedIcon}
          {appliedLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', selectedOption === 'custom' ? 'w-[750px]' : '')}
        side='left'
        align='start'
      >
        <div className='flex w-full overflow-hidden rounded-md border'>
          {/* Sidebar options */}
          <div
            className={cn(
              'w-full',
              selectedOption === 'custom' && 'w-[180px] border-r'
            )}
          >
            {OPTIONS.map(opt => (
              <div
                key={opt.value}
                onClick={() =>
                  opt.value === 'custom'
                    ? setSelectedOption('custom')
                    : handlePreset(opt.value)
                }
                className={cn(
                  'hover:bg-muted flex cursor-pointer items-center gap-2 px-4 py-2 text-sm',
                  selectedOption === opt.value &&
                    'bg-gray-100 font-semibold text-primary'
                )}
              >
                {opt.icon} {opt.label}
              </div>
            ))}
          </div>

          {/* Custom calendar */}
          {selectedOption === 'custom' && (
            <div className='w-full flex-1 p-4'>
              <Calendar
                mode='range'
                selected={customRange}
                onSelect={handleCalendarChange}
                numberOfMonths={2}
                initialFocus
                defaultMonth={customRange?.from || today}
                disabled={date =>
                  isBefore(date, minSelectableDate) ||
                  isAfter(date, maxSelectableDate)
                }
              />
              <div className='mt-4 flex w-full items-center justify-evenly gap-2'>
                <Input
                  type='date'
                  className='w-48'
                  min={format(minSelectableDate, 'yyyy-MM-dd')}
                  max={format(maxSelectableDate, 'yyyy-MM-dd')}
                  value={
                    customRange?.from
                      ? format(customRange.from, 'yyyy-MM-dd')
                      : ''
                  }
                  onChange={e => handleManualDate('from', e.target.value)}
                />
                <span>to</span>
                <Input
                  className='w-48'
                  type='date'
                  min={format(minSelectableDate, 'yyyy-MM-dd')}
                  max={format(maxSelectableDate, 'yyyy-MM-dd')}
                  value={
                    customRange?.to ? format(customRange.to, 'yyyy-MM-dd') : ''
                  }
                  onChange={e => handleManualDate('to', e.target.value)}
                />
              </div>
              <div className='mt-4 flex justify-end gap-2'>
                <Button variant='ghost' onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
