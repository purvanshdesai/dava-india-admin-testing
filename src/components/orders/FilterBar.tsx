'use client'

import { DateRange } from 'react-day-picker'
import DateRangeFilter from './DateRangeFilter'

interface LocationFilterBarProps {
  filters: {
    dateRange: DateRange | undefined
    dateFilterType: string
  }
  setFilters: React.Dispatch<
    React.SetStateAction<LocationFilterBarProps['filters']>
  >
}

export default function DateRangeFilterComponent({
  filters,
  setFilters
}: LocationFilterBarProps) {
  return (
    <div className='flex items-center justify-center gap-4'>
      {/* Date Range */}
      <DateRangeFilter
        value={filters.dateRange}
        onApply={(range, option) => {
          setFilters(prev => ({
            ...prev,
            dateRange: range ?? undefined,
            dateFilterType: option
          }))
        }}
      />
    </div>
  )
}
