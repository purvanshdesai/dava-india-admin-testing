import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { UseFormReturn } from 'react-hook-form'

const FormMultiField = ({
  formInstance: form,
  label,
  name,
  isReq,
  placeholder,
  type
}: {
  formInstance: UseFormReturn
  type: string
  isReq?: boolean
  label?: string
  name: string
  placeholder?: string
}) => {
  const [inputText, setInputText] = useState('') // Store input text

  // Validate based on type (email, phone, keyword)
  const validateInput: any = (input: any) => {
    const value = String(input || '').trim()
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    } else if (type === 'phone') {
      const phoneRegex = /^\+?[0-9\s]{10,15}$/
      const plainNumber = value.replace(/\s+/g, '') // Remove spaces for validation
      return (
        phoneRegex.test(value) &&
        plainNumber.length >= 10 &&
        plainNumber.length <= 13
      )
    }
    // For keywords, no specific validation is applied
    return input.length > 0
  }

  // Add the input to the array in form state
  const addInput = () => {
    const input = inputText.trim()

    // If input is valid and not already added
    if (
      input &&
      !form.getValues(name)?.includes(input) &&
      validateInput(input)
    ) {
      form.setValue(name, [...(form.getValues(name) || []), input])
      setInputText('') // Clear the input field
    }
  }

  // Remove input by index
  const removeInput = (idx: any) => {
    const updatedList = form
      .getValues(name)
      .filter((_: any, index: number) => index !== idx)
    form.setValue(name, updatedList)
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission on Enter
      addInput()
    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel className='text-sm text-black dark:text-gray-300'>
            {label}
            {isReq && <span className='text-red-600'>*</span>}
          </FormLabel>
          <FormControl className='scrollbar-visible max-h-96 overflow-y-scroll dark:bg-black'>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='multi-input'
                className='flex w-full flex-wrap gap-2 rounded-md border px-1 dark:border-gray-600'
                onClick={() => setInputText('')} // Clear input on label click
              >
                {/* Map over the array of values in the form state */}
                {form.getValues(name)?.map((item: any, idx: number) => (
                  <span
                    key={idx}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                      validateInput(item)
                        ? 'bg-indigo-100 text-black dark:bg-gray-600 dark:text-gray-300'
                        : 'border border-red-600 text-red-600'
                    )}
                  >
                    {item}
                    <button
                      type='button'
                      className='cursor-pointer text-red-600'
                      onClick={() => removeInput(idx)}
                    >
                      x
                    </button>
                  </span>
                ))}

                {/* Input field for adding values */}
                <Input
                  type='text'
                  id='multi-input'
                  className='flex-1 text-sm outline-none dark:bg-black dark:text-gray-300'
                  placeholder={placeholder}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown} // Add value on Enter key press
                  onBlur={addInput} // Add value on blur
                  autoComplete='off'
                />
              </label>
            </div>
          </FormControl>
          <FormMessage />
          <div style={{ fontSize: '10px' }} className='pl-1 text-gray-500'>
            Press enter after typing to add multiple{' '}
            {type === 'email'
              ? 'emails'
              : type === 'phone'
                ? 'phone numbers'
                : 'keywords'}
          </div>
        </FormItem>
      )}
    />
  )
}

export default FormMultiField
