import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

const FormMultiSelectField = ({
  formInstance: form,
  label,
  name,
  isData = false,
  items = [],
  isSingle = false,
  isReq
}: {
  formInstance: UseFormReturn
  isData?: boolean
  items: any
  isSingle?: boolean
  isReq?: boolean
  label?: string
  name: string
}) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]) // Store selected items
  const [dropdownOpen, setDropdownOpen] = useState(false) // Toggle dropdown
  const inputRef = useRef<any>(null) // Reference for focusing input
  const dropdownRef = useRef<any>(null)

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
    if (!dropdownOpen && inputRef?.current) {
      inputRef.current.focus()
    }
  }

  const handleSelect = (option: any) => {
    if (isSingle) {
      const updatedSelection: any =
        selectedItems[0]?._id === option._id ? [] : [option]
      setSelectedItems(updatedSelection)
      form.setValue(
        name,
        updatedSelection.map((item: any) => item._id)
      )
      setDropdownOpen(false)
    } else {
      // Existing logic for multi-select
      const isSelected = selectedItems.includes(option)
      const updatedSelection: any = isSelected
        ? selectedItems.filter((item: any) => item._id !== option._id)
        : [...selectedItems, option]

      setSelectedItems(updatedSelection)
      form.setValue(
        name,
        updatedSelection.map((item: any) => item._id)
      )
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({}) => (
        <FormItem>
          <FormLabel className='text-sm text-black dark:text-gray-300'>
            {label}
            {isReq && <span className='text-red-600'>*</span>}
          </FormLabel>
          <FormControl className='relative dark:bg-black'>
            <div className='flex flex-col'>
              {/* Display selected items count in the placeholder */}
              <div
                ref={inputRef}
                onClick={toggleDropdown}
                className='cursor-pointer rounded-md border p-2 text-sm dark:bg-black dark:text-gray-300'
              >
                {selectedItems.length > 0
                  ? `${selectedItems.length} ${label}(s) selected`
                  : 'Select items...'}
              </div>
              {/* Dropdown for items */}
              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  style={{ marginTop: '2.5rem' }}
                  className='absolute z-10 mt-1 max-h-60 min-w-72 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg'
                >
                  {items.length ? (
                    items.map((option: any) => (
                      <div
                        key={option._id}
                        className={`flex cursor-pointer items-center justify-between p-2 text-black hover:bg-indigo-100 dark:bg-gray-600 dark:text-gray-300`}
                        onClick={() => handleSelect(option)}
                      >
                        {isData ? option.name : option.productName}
                        {selectedItems.includes(option) && <Check size={20} />}
                      </div>
                    ))
                  ) : (
                    <div className='p-2 text-gray-500'>No items found</div>
                  )}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormMultiSelectField
