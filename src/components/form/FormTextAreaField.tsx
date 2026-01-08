import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Textarea, TextareaProps } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { UseFormReturn } from 'react-hook-form'

const FormTextAreaField = ({
  formInstance: form,
  name,
  label,
  isSmall,
  disabled = false,
  className
}: TextareaProps & {
  formInstance: UseFormReturn
  name: string
  label?: string
  isSmall?: boolean
  disabled?: boolean
}) => {
  return (
    <FormField
      control={form.control}
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
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              disabled={disabled}
              className={cn('rounded-lg', className)}
              {...field}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormTextAreaField
