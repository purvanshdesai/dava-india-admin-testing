import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { UseFormReturn } from 'react-hook-form'
import { ComponentProps } from 'react'

const FormSwitchField = ({
  formInstance: form,
  label,
  isSmall,
  name,
  className,
  ...fields
}: {
  formInstance: UseFormReturn
  label: string
  isSmall?: boolean
  name: string
} & ComponentProps<typeof Switch>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex items-center gap-2'>
          <FormLabel
            className={cn(
              isSmall ? 'text-sm' : 'text-lg',
              'text-black dark:text-gray-300'
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <span>
              <Switch
                checked={field.value}
                onCheckedChange={value => form.setValue(name, value)}
                className={className}
                {...field}
                {...fields}
              />
            </span>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormSwitchField
