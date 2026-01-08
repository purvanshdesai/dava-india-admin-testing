'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UseFormReturn } from 'react-hook-form'

const FormRadioButton = ({
  formInstance: form,
  label,
  name,
  isSmall,
  isReq,
  className,
  disabled,
  options
}: {
  formInstance: UseFormReturn
  isSmall?: boolean
  isReq?: boolean
  label?: string
  name: string
  className?: string
  disabled?: boolean
  options?: any
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className={cn(
              isSmall ? 'text-sm' : 'text-lg',
              'block text-black dark:text-gray-300'
            )}
          >
            {label}
            {isReq && <span className='text-red-600'>*</span>}
          </FormLabel>
          <FormControl className='flex items-center gap-3'>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              {options.map((option: any) => (
                <div key={option.value} className='flex items-center space-x-2'>
                  <RadioGroupItem
                    id={option.value}
                    value={option.value}
                    className={cn(
                      'dark:bg-black dark:text-gray-300',
                      className
                    )}
                  />
                  <label
                    htmlFor={option.value}
                    className='text-sm text-gray-800 dark:text-gray-300'
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormRadioButton
