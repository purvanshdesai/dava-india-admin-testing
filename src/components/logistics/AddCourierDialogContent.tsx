import {
  Form,
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
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogClose } from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { courierSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFetchCourierPartners } from '@/utils/hooks/logisticsHooks'
import { useDebounce } from '@/utils/hooks/debounce'
import FormRadioButton from '@/components/form/FormRadioButton'
import { useToast } from '@/hooks/use-toast'

export default function AddCourierDialogContent({
  ruleCouriers = [],
  setRuleCouriers
}: {
  ruleCouriers: any[]
  setRuleCouriers: (
    deliveryMode: string,
    partner: string,
    couriers: any[],
    packageSize: 'small' | 'big'
  ) => void
}) {
  const { toast } = useToast()
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [filter, setFilter] = useState<any>()

  const courierForm = useForm<z.infer<typeof courierSchema>>({
    resolver: zodResolver(courierSchema),
    values: {
      deliveryMode: 'standard',
      mode: 'serviceability',
      logisticPartner: 'shiprocket',
      search: '',
      packageSize: 'small',
      onlyLocal: false,
      QcCheck: false,
      courierPartners: [],
      sourcePostalCode: '',
      destinationPostalCode: ''
    }
  })
  const debounceSearch = useDebounce(courierForm.watch('search'), 1000)
  const debounceSourcePostalCode = useDebounce(
    courierForm.watch('sourcePostalCode'),
    1000
  )
  const debounceDestinationPostalCode = useDebounce(
    courierForm.watch('destinationPostalCode'),
    1000
  )
  const { data, isPending, isError, error } = useFetchCourierPartners(filter)

  const handleCheckboxChange = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value))
    } else {
      setSelectedValues([...selectedValues, value])
    }
  }

  const searchCouriers = () => {
    setFilter({
      deliveryMode: courierForm.watch('deliveryMode'),
      logisticPartner: courierForm.watch('logisticPartner'),
      searchMode: courierForm.watch('mode'),
      search: debounceSearch,
      packageSize: courierForm.watch('packageSize'),
      onlyLocal: courierForm.watch('onlyLocal'),
      qcCheck: courierForm.watch('QcCheck'),
      sourcePostalCode:
        courierForm.watch('mode') === 'serviceability'
          ? debounceSourcePostalCode
          : '',
      destinationPostalCode:
        courierForm.watch('mode') === 'serviceability'
          ? debounceDestinationPostalCode
          : ''
    })
  }

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error',
        description: (error as any)?.response?.data?.message
      })
    }
  }, [isError])

  if (isPending) return <div>Loading...</div>

  return (
    <div>
      <Form {...courierForm}>
        <form onSubmit={courierForm.handleSubmit(searchCouriers)}>
          <div className='space-y-5'>
            <FormField
              control={courierForm.control}
              name={'deliveryMode'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Delivery Mode
                    <span className='text-red-600'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select mode for searching' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='standard'>
                        Standard Delivery
                      </SelectItem>
                      <SelectItem value='oneDay'>Same Day Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={courierForm.control}
              name={'logisticPartner'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Logistics Partner
                    <span className='text-red-600'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={value => {
                      field.onChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select logistics partner' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courierForm.watch('deliveryMode') === 'standard' && (
                        <>
                          <SelectItem value='shiprocket'>Shiprocket</SelectItem>
                          <SelectItem value='delhivery'>Delhivery</SelectItem>
                        </>
                      )}

                      {courierForm.watch('deliveryMode') === 'oneDay' && (
                        <>
                          <SelectItem value='swiggy'>Swiggy</SelectItem>
                          <SelectItem value='shiprocketQuick'>
                            Shiprocket Quick
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={courierForm.control}
              name={'mode'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mode
                    <span className='text-red-600'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select mode for searching' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='serviceability'>
                        Search by courier serviceability
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {courierForm.watch('mode') === 'serviceability' && (
              <>
                {courierForm.watch('deliveryMode') === 'standard' && (
                  <div className={'flex items-center gap-3'}>
                    <FormRadioButton
                      formInstance={courierForm as any as UseFormReturn}
                      name={'packageSize'}
                      label={'Package size'}
                      isSmall={true}
                      options={[
                        {
                          value: 'small',
                          label: 'Small (14x10x5 - below 500g)'
                        },
                        { value: 'big', label: 'Big (20x16x5 - upto 2kg)' }
                      ]}
                    />
                  </div>
                )}
                <div className={'flex items-center justify-between gap-3'}>
                  <div className={'w-full'}>
                    <FormField
                      control={courierForm.control}
                      name={'sourcePostalCode'}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Pickup Postal Code
                            <span className='text-red-600'>*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              className='w-full'
                              placeholder='Source Postal Code'
                              type={'number'}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className={'w-full'}>
                    <FormField
                      control={courierForm.control}
                      name={'destinationPostalCode'}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Delivery Postal Code
                            <span className='text-red-600'>*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              className='w-full'
                              placeholder='Destination Postal Code'
                              type={'number'}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {courierForm.watch('logisticPartner') === 'shiprocket' && (
              <div className='flex items-center gap-4'>
                <FormField
                  control={courierForm.control}
                  name='onlyLocal'
                  render={({ field }) => (
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='onlyLocal'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor='onlyLocal'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        Only Local
                      </label>
                    </div>
                  )}
                />
                <FormField
                  control={courierForm.control}
                  name='QcCheck'
                  render={({ field }) => (
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='QcCheck'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor='QcCheck'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        QC Check
                      </label>
                    </div>
                  )}
                />
              </div>
            )}

            <div className='pt-5'>
              {courierForm.watch('logisticPartner') === 'shiprocket' && (
                <FormField
                  control={courierForm.control}
                  name={'search'}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className='w-full'
                          placeholder='Search courier'
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <div className={'flex justify-center pt-5'}>
                <Button
                  onClick={() => {
                    courierForm.handleSubmit(searchCouriers)()
                  }}
                >
                  Search Courier Availability
                </Button>
              </div>

              {data && data?.length > 0 && (
                <>
                  <h1 className='my-4 font-medium'>Courier Partners</h1>
                  <div className='flex max-h-[300px] flex-col gap-2 overflow-y-scroll px-2'>
                    {data?.map((item: any, index: number) => (
                      <div
                        key={index}
                        className='rounded border border-[#E3E9F0] bg-gray-100 p-4'
                      >
                        <div className='flex space-x-2'>
                          <Checkbox
                            className={'mx-2 mt-1'}
                            key={item.id}
                            value={item.id}
                            checked={
                              ruleCouriers.includes(item.id) ||
                              selectedValues.includes(item.id)
                            }
                            disabled={ruleCouriers.includes(item.id)}
                            onCheckedChange={() =>
                              handleCheckboxChange(item.id)
                            }
                          />
                          <div className={'text-sm'}>
                            <label className='py-1 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                              {item?.name}
                            </label>
                            {courierForm.watch('mode') === 'serviceability' && (
                              <>
                                <div className={'py-1'}>
                                  Delivery charges:{' '}
                                  {item.charges
                                    ? `₹${item.charges}`
                                    : 'Not Provided'}
                                </div>
                                <div>
                                  Estimated delivery time: {item.etd}
                                  {' - '}
                                  {item.etdHours
                                    ? `${item.etdHours} Hours`
                                    : item.etdMinutes
                                      ? `${item.etdMinutes} Minutes`
                                      : ''}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className='flex justify-center pt-6'>
              <div className='flex items-center gap-4'>
                <DialogClose asChild>
                  <Button type='button' variant={'outline'}>
                    Cancel
                  </Button>
                </DialogClose>

                <DialogClose asChild>
                  <Button
                    type='button'
                    onClick={() =>
                      setRuleCouriers(
                        courierForm.watch('deliveryMode'),
                        courierForm.watch('logisticPartner'),
                        selectedValues,
                        courierForm.watch('packageSize') as 'small' | 'big'
                      )
                    }
                  >
                    Add
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
