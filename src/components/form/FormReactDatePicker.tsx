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
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { forwardRef } from 'react'
import { Calendar } from 'lucide-react'

const FormReactDatePicker = ({
  formInstance: form,
  label,
  isSmall,
  isReq,
  name,
  className
}: {
  formInstance: UseFormReturn
  name: string
  label?: string
  isSmall?: boolean
  isReq?: boolean
} & InputProps) => {
  interface CustomInputProps {
    value?: string
    onClick?: () => void
    className?: string
  }

  const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
    ({ value, onClick }, ref) => (
      <div className='relative flex items-center'>
        <Input
          ref={ref}
          value={value}
          onClick={onClick}
          readOnly
          placeholder='Select a date'
          className='cursor-pointer pr-10' // Add padding to make space for the icon
        />
        <Calendar
          className='absolute right-3 cursor-pointer text-gray-500' // Position the icon
          onClick={onClick} // Clicking the icon also opens the calendar
        />
      </div>
    )
  )

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
            <div>
              <DatePicker
                className={cn('rounded-lg dark:text-gray-300', className)}
                selected={field.value}
                onChange={date => form.setValue(field.name, date)}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode='select'
                customInput={<CustomInput className='' />}
                dateFormat='dd/MM/yyyy'
              />
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormReactDatePicker
