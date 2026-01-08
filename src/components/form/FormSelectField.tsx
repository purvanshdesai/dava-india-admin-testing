import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { UseFormReturn } from 'react-hook-form'

const FormSelectField = ({
  formInstance: form,
  items = [],
  isSmall,
  isReq,
  label,
  name,
  placeholder
}: {
  formInstance?: UseFormReturn
  items: { label: string; value: string }[]
  isSmall?: boolean
  isReq?: boolean
  label?: string
  name: string
  placeholder?: string
  className?: string
}) => {
  return (
    <FormField
      control={form?.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className={cn(
              isSmall ? 'text-sm' : 'text-lg',
              'text-black dark:text-gray-300'
            )}
          >
            {label}
            {label && isReq ? <span className='text-red-600'>*</span> : null}
          </FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
            >
              <SelectTrigger className='w-full rounded-lg dark:text-gray-300'>
                <SelectValue
                  placeholder={placeholder}
                  className='dark:text-gray-300'
                />
              </SelectTrigger>
              <SelectContent>
                {items.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormSelectField
