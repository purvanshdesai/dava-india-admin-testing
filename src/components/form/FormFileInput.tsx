'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

export function FormFileInput({
  form,
  label,
  name,
  isReq,
  className,
  isSmall,
  ...props
}: any) {
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
          <FormControl>
            <Input
              id={name}
              type='file'
              onChange={event => {
                if (event?.target?.files) field.onChange(event.target.files[0]) // Get the selected file
              }}
              className={cn(className)}
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
