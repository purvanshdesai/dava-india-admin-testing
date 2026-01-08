import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useEffect, useState } from 'react'

const yearStarted = 2024

interface DateSelectorProps {
  onDateChange: (value: { month: string; year: string }) => void
}

export function DashboardDateSelector({ onDateChange }: DateSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    (new Date().getMonth() + 1).toString()
  )
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    new Date().getFullYear().toString()
  )

  const currentDate = new Date()
  const currentYear = new Date().getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // getMonth() is 0-based

  // Generate array of years from 2023 to current year
  const years = Array.from({ length: currentYear - yearStarted + 1 }, (_, i) =>
    (yearStarted + i).toString()
  )

  // All months
  const allMonths = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  // Filter months if selected year is the current year
  const getMonthsForYear = (year: string | undefined) => {
    const numericYear = typeof year === 'string' ? parseInt(year) : year
    return numericYear === currentYear
      ? allMonths.filter(month => parseInt(month.value) <= currentMonth)
      : allMonths
  }

  useEffect(() => {
    if (selectedMonth && selectedYear)
      onDateChange({ year: selectedYear, month: selectedMonth })

    const currentMonths = getMonthsForYear(selectedYear)

    if (!currentMonths.find(m => m.value === selectedMonth))
      setSelectedMonth(allMonths[0].value)
  }, [selectedMonth, selectedYear])

  return (
    <div className='flex flex-col gap-4 sm:flex-row'>
      <div className='w-44 flex-1 space-y-2'>
        <label htmlFor='year-select' className='text-sm font-medium'>
          Year
        </label>
        <Select value={selectedYear} onValueChange={v => setSelectedYear(v)}>
          <SelectTrigger id='year-select' className='w-full'>
            <SelectValue placeholder='Select year' />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='w-44 flex-1 space-y-2'>
        <label htmlFor='month-select' className='text-sm font-medium'>
          Month
        </label>
        <Select value={selectedMonth} onValueChange={v => setSelectedMonth(v)}>
          <SelectTrigger id='month-select' className='w-full'>
            <SelectValue placeholder='Select month' />
          </SelectTrigger>
          <SelectContent>
            {getMonthsForYear(selectedYear).map(month => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
