'use client'
import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { ChevronDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput
} from './command'
import { Checkbox } from './checkbox'
import { Input } from './input'

type TProps = {
  labelField: string
  placeholder: string
  valueField: string
  data: any[]
  onSelect: (value: any) => void
  isItemSelected: (item: any) => boolean
  selectedItems: any
  handleInputChange?: any
  enableDynamicSearch?: any
  handleScroll?: any
}

export default function MultiSelectInput({
  labelField,
  placeholder,
  data,
  valueField,
  onSelect,
  isItemSelected,
  selectedItems,
  handleInputChange,
  enableDynamicSearch = false,
  handleScroll
}: TProps) {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <div className='pt-1'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role='combobox'
            aria-expanded={open}
            className='flex max-h-fit w-full items-center justify-between break-words rounded-md border border-[#E2E1E5] px-3 py-2'
          >
            <div className='break-words' style={{ wordWrap: 'break-word' }}>
              {selectedItems ? selectedItems : placeholder}
            </div>
            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </div>
        </PopoverTrigger>
        <PopoverContent
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          className='p-0'
        >
          <Command>
            {enableDynamicSearch ? (
              <Input
                placeholder='For more zip codes search here e.g. 440034'
                onChange={e => {
                  handleInputChange(e.target.value) // Pass the input value to debounce handler
                }}
              />
            ) : (
              <CommandInput placeholder={'search'} />
            )}
            <CommandList onScroll={handleScroll}>
              <CommandEmpty>Not found</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={index}
                    value={item[valueField]}
                    onSelect={() => onSelect(item)}
                  >
                    {/* <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isItemSelected(item) ? 'opacity-100' : 'opacity-0'
                      )}
                    /> */}
                    <div className='flex items-center gap-2'>
                      <Checkbox checked={isItemSelected(item)} />
                      <div className='font-semibold'>{item[labelField]}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
