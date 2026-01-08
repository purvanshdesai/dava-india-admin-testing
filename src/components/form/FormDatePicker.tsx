'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UseFormReturn } from 'react-hook-form'

const FormDatePicker = ({
  formInstance: form,
  label,
  name,
  isSmall,
  isReq,
  className,
  placeholder,
  showRadioOption = false
}: {
  formInstance: UseFormReturn
  isSmall?: boolean
  isReq?: boolean
  label?: string
  name: string
  placeholder?: string
  className?: string
  showRadioOption?: boolean
}) => {
  const [isSelectDate, setIsSelectDate] = useState(!showRadioOption)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // Set initial radio option based on whether a date is selected
        useEffect(() => {
          setIsSelectDate(field.value != null)
        }, [field.value])

        return (
          <FormItem>
            {label && (
              <FormLabel
                className={cn(
                  isSmall ? 'text-sm' : 'text-lg',
                  'block text-black dark:text-gray-300'
                )}
              >
                {label}
                {isReq && <span className='text-red-600'>*</span>}
              </FormLabel>
            )}

            {/* Radio Group Options */}
            {showRadioOption && (
              <RadioGroup
                value={isSelectDate ? 'selectDate' : 'neverEnd'}
                onValueChange={value => {
                  const isSelectingDate = value === 'selectDate'
                  setIsSelectDate(isSelectingDate)

                  // Clear the date from form state if "Never End" is selected
                  if (!isSelectingDate) {
                    field.onChange(null)
                  }
                }}
                className='mb-2 flex items-center space-x-4'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem id='neverEnd' value='neverEnd' />
                  <label
                    htmlFor='neverEnd'
                    className='text-sm text-black dark:text-gray-300'
                  >
                    Never End
                  </label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem id='selectDate' value='selectDate' />
                  <label
                    htmlFor='selectDate'
                    className='text-sm text-black dark:text-gray-300'
                  >
                    Select Date
                  </label>
                </div>
              </RadioGroup>
            )}

            {/* Date Picker */}
            <FormControl>
              {isSelectDate && (
                <Popover>
                  <PopoverTrigger className='dark:border-gray-900' asChild>
                    <Button
                      variant={'datepicker'}
                      className={cn(
                        'w-full justify-start text-left font-normal dark:bg-black dark:text-gray-300',
                        !field.value && 'text-muted-foreground',
                        className
                      )}
                    >
                      {field.value
                        ? format(field.value, 'PPP')
                        : placeholder || 'Pick a date'}
                      <CalendarIcon className='ml-auto h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={date => field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export default FormDatePicker
