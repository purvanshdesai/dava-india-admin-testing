'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  // CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useEffect } from 'react'

export type ComboboxProps = {
  items: { label: string; value: string }[]
  multiple?: boolean
  label: string
  className?: string
  fieldValue: string | string[]
  setFieldValue: (value: string | string[]) => void
  disabled?: boolean
}
export function Combobox({
  items = [],
  multiple,
  label,
  className,
  fieldValue,
  disabled = false,
  setFieldValue
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [values, setValues] = React.useState<string | string[]>(
    fieldValue ?? (multiple ? [] : '')
  )
  const [searchTerm, setSearchTerm] = React.useState('')

  const filteredItems = items?.filter((item: any) =>
    item?.label?.toLowerCase().includes(searchTerm?.toLowerCase())
  )
  useEffect(() => {
    setFieldValue(values)
  }, [values])

  useEffect(() => {
    if (!multiple && fieldValue) setValues(fieldValue)
  }, [fieldValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={disabled} asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('h-auto w-[200px] justify-between', className)}
        >
          {values && values?.length ? (
            <div className={'flex flex-wrap items-center'}>
              {items
                .filter(item => {
                  if (Array.isArray(values)) return values.includes(item.value)
                  return values === item.value
                })
                .map((item, index) => (
                  <div
                    key={index}
                    className={
                      'rounded border border-b-primary-light-blue bg-gray-50 px-2 py-1 text-xs'
                    }
                  >
                    {item.label}
                  </div>
                ))}
            </div>
          ) : (
            `Select ${label.toLowerCase()}...`
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-0'>
        <Command>
          {/* <CommandInput placeholder={`Search ${label.toLowerCase()}...`} /> */}
          <div className='relative'>
            {' '}
            <input
              type='text'
              placeholder={`Search ${label.toLowerCase()}...`}
              className='w-full rounded-md border border-gray-300 p-2 px-6 text-xs outline-none'
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setOpen(true)} // Ensure the popover opens on focus
            />
            <Search
              size={14}
              className='absolute left-2 top-2.5 text-gray-400'
            />
          </div>

          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {filteredItems?.map(item => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={currentValue => {
                    if (multiple && Array.isArray(values))
                      values.includes(currentValue)
                        ? setValues(values.filter(v => v !== currentValue))
                        : setValues([...values, currentValue])
                    else setValues(currentValue)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      (
                        Array.isArray(values)
                          ? values.includes(item.value)
                          : values === item.value
                      )
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
