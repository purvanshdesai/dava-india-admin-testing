import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input, InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const FormInputField = ({
  formInstance: form,
  label,
  isSmall,
  isReq,
  name,
  className,
  placeholder,
  ...fields
}: {
  formInstance: UseFormReturn
  name: string
  label?: string
  isSmall?: boolean
  isReq?: boolean
} & InputProps) => {
  const [isView, setIsView] = useState(false)

  return (
    <FormField
      control={form?.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel
              className={cn(
                isSmall ? 'text-sm' : 'text-lg',
                'text-black dark:text-gray-300'
              )}
            >
              {label}
              {label && isReq ? <span className='text-red-600'>*</span> : null}
            </FormLabel>
          )}
          <FormControl>
            <div className='relative'>
              <Input
                placeholder={placeholder}
                className={cn('rounded-lg dark:text-gray-300', className)}
                {...field}
                {...fields}
                type={isView ? 'text' : 'password'}
              />
              {isView ? (
                <Eye
                  className='absolute right-4 top-2 z-10 cursor-pointer text-gray-500'
                  onClick={() => {
                    setIsView(!isView)
                  }}
                />
              ) : (
                <EyeOff
                  className='absolute right-4 top-2 z-10 cursor-pointer text-gray-500'
                  onClick={() => setIsView(!isView)}
                />
              )}
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormInputField
