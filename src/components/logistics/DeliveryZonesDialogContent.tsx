import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import React, { useState } from 'react'
import { useGetDeliveryPolices } from '@/utils/hooks/deliveryPolicyHooks'
import { useDebounce } from '@/utils/hooks/debounce'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'

export default function DeliveryZonesDialogContent({
  ruleDeliveryZones = [],
  setRuleDeliveryZones
}: {
  ruleDeliveryZones: string[]
  setRuleDeliveryZones: (deliverZones: string[]) => void
}) {
  const [pagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [searchText, setSearchText] = useState<string>('')
  const [selectedValues, setSelectedValues] = useState<string[]>([])

  const debounceFilter = useDebounce(searchText, 1000)
  const { data: deliveryPolices, isLoading } = useGetDeliveryPolices({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: [{ id: 'zoneName', value: debounceFilter }]
  })

  const handleCheckboxChange = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value))
    } else {
      setSelectedValues([...selectedValues, value])
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <Input
        placeholder='Search delivery zone'
        onInput={(event: any) => {
          setSearchText(event.target.value)
        }}
      />
      <h1 className='my-4 font-medium'>Courier Partners</h1>
      <div className='flex max-h-[500px] flex-col gap-2 overflow-y-scroll'>
        {deliveryPolices.data.map((item: any, index: number) => (
          <div key={index} className='rounded border border-[#E3E9F0] p-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                key={item._id}
                value={item._id}
                checked={
                  ruleDeliveryZones.includes(item._id) ||
                  selectedValues.includes(item._id)
                }
                disabled={ruleDeliveryZones.includes(item._id)}
                onCheckedChange={() => handleCheckboxChange(item._id)}
              />
              <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                {item?.zoneName}
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className={'my-3 flex items-center justify-end gap-3'}>
        <DialogClose>
          <Button variant={'outline'} className={'w-32'}>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose>
          <Button
            variant={'default'}
            className={'w-32'}
            onClick={() => setRuleDeliveryZones(selectedValues)}
          >
            Add
          </Button>
        </DialogClose>
      </div>
    </div>
  )
}
