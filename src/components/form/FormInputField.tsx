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
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent negative values or non-integer values by enforcing positive integers
    const value = event.target.value
    if (
      fields.type === 'number' &&
      (isNaN(Number(value)) || Number(value) < 0)
    ) {
      event.target.value = value.replace(/[^0-9]/g, '')
    }
  }

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
            <Input
              placeholder={placeholder}
              className={cn('rounded-lg dark:text-gray-300', className)}
              {...field}
              {...fields}
              onInput={handleInput}
              onWheel={e => {
                if (fields.type === 'number') {
                  e.preventDefault() // stop the wheel changing the value
                  e.stopPropagation() // optional: stop bubbling
                }
                // if the user passed their own onWheel via fields, call it:
                if (typeof fields.onWheel === 'function') {
                  fields.onWheel(e)
                }
              }}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormInputField
