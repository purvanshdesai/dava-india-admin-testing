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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

const FormStringArrayField = ({
  formInstance: form,
  label,
  name,
  isReq,
  placeholder,
  id,
  valueRegex,
  isSuggestion = false,
  suggestionValues = [],
  disabled = false
}: {
  formInstance: UseFormReturn
  name: string
  label?: string
  isReq?: boolean
  placeholder?: string
  id?: string
  valueRegex?: RegExp
  isSuggestion?: boolean
  suggestionValues?: string[]
  disabled?: boolean
}) => {
  const [inputText, setInputText] = useState('') // Store input text
  const [showPopover, setShowPopover] = useState(false)

  // Validate if the input is a valid phone number
  const validateString = (str: string) => {
    if (!valueRegex) return true
    return valueRegex.test(str)
  }

  // Add the string to the array in form state
  const addString = () => {
    const str = inputText.trim()

    // If str is valid and not already added
    if (str && !form.getValues(name)?.includes(str)) {
      form.setValue(name, [...(form.getValues(name) || []), str])
      setInputText('') // Clear the input field
    }
  }

  // Remove string by index
  const removeString = (idx: number) => {
    console.log(idx, '===before ======== ', form.getValues(name))
    const updatedStrings = form
      .getValues(name)
      .filter((_: string, index: number) => index !== idx)
    console.log('===after ======== ', updatedStrings)
    form.setValue(name, updatedStrings)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission on Enter
      addString()
      setShowPopover(false)
    }
  }

  const addSuggestion = (suggestion: string) => {
    if (!form.getValues(name)?.includes(suggestion)) {
      form.setValue(name, [...(form.getValues(name) || []), suggestion])
    }
    setShowPopover(false)
    setInputText('') // Clear the input field
  }

  return (
    <FormField
      control={form.control}
      disabled={disabled}
      name={name}
      render={({}) => (
        <FormItem>
          <FormLabel className='text-sm text-black dark:text-gray-300'>
            {label}
            {label && isReq ? <span className='text-red-600'>*</span> : null}
          </FormLabel>
          <FormControl className='dark:bg-black'>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor={id}
                className='flex w-full flex-wrap gap-2 rounded-md border p-1.5 dark:border-gray-600'
                onClick={e => e.preventDefault()}
              >
                {/* Map over the array of strings in the form state */}
                {form.getValues(name)?.map((str: string, idx: number) => (
                  <span
                    key={idx}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                      validateString(str)
                        ? 'bg-indigo-100 text-black dark:bg-gray-600 dark:text-gray-300'
                        : 'border border-red-600 text-red-600'
                    )}
                  >
                    {str}
                    <button
                      type='button'
                      className='cursor-pointer text-red-600'
                      onClick={() => removeString(idx)}
                    >
                      x
                    </button>
                  </span>
                ))}

                {/* Input field for adding string */}
                {isSuggestion ? (
                  <Popover open={showPopover} onOpenChange={setShowPopover}>
                    <PopoverTrigger asChild>
                      <Input
                        type='text'
                        id={id}
                        className='w-full flex-1 text-sm outline-none dark:bg-black dark:text-gray-300'
                        placeholder={placeholder}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown} // Add string on Enter key press
                        onFocus={() => setShowPopover(true)} // Show popover on input focus
                        autoComplete='off'
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className='-p-4 flex flex-col gap-1'>
                        {suggestionValues
                          .filter(suggestion =>
                            suggestion
                              .toLowerCase()
                              .includes(inputText.toLowerCase())
                          ) // Filter suggestions based on input text
                          .map((suggestion, index) => (
                            <button
                              key={index}
                              className='p-2 text-left text-sm text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                              onClick={() => addSuggestion(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    type='text'
                    disabled={disabled}
                    id={id}
                    className='w-full flex-1 text-sm outline-none dark:bg-black dark:text-gray-300'
                    placeholder={placeholder}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown} // Add string on Enter key press
                    onBlur={addString} // Add string on blur
                    // autoComplete='off'
                  />
                )}
              </label>
            </div>
          </FormControl>
          <FormMessage />
          <div style={{ fontSize: '10px' }} className='pl-1 text-gray-500'>
            Press enter after typing to add multiple values
          </div>
        </FormItem>
      )}
    />
  )
}

export default FormStringArrayField
