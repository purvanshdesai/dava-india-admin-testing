'use client'
import StoreTable from '@/components/deliveryPolicy/StoreTable'
import ZipCodeTable from '@/components/deliveryPolicy/ZipCodeTable'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import MultiSelectInput from '@/components/ui/MultiSelectInput'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useFooter } from '@/context/Footer'
import { deliveryPolicySchema } from '@/lib/zod'
import {
  useGetDeliveryPolicy,
  usePatchDeliveryPolicy,
  useSubmitAddDeliveryPolicy,
  useFetchDeliveryModeTemplates
} from '@/utils/hooks/deliveryPolicyHooks'
import { useFetchZipCodes } from '@/utils/hooks/zipCodeHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import AppBreadcrumb from '@/components/Breadcrumb'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/utils/hooks/debounce'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FormSwitchField from '@/components/form/FormSwitchField'
import { Trash2Icon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export type TDeliveryPolicyForm = z.infer<typeof deliveryPolicySchema>

const Footer = ({
  onSubmit,
  onBack,
  loading
}: {
  onSubmit: () => void
  onBack: () => void
  loading: any
}) => {
  return (
    <div className={'flex h-full items-center justify-end gap-4 px-5'}>
      <Button
        className={
          'w-24 border border-orange-500 bg-white text-center text-orange-500'
        }
        onClick={onBack}
      >
        Cancel
      </Button>
      <Button
        className={'w-24 text-center'}
        loader={loading}
        onClick={onSubmit}
      >
        Save
      </Button>
    </div>
  )
}

const DeliveryPolicyPage = ({ params }: { params: { id: string } }) => {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const isEdit = params.id == 'new' ? false : true
  const { setFooterContent } = useFooter()
  const router = useRouter()
  const [zipCodesD, setZipCodes] = useState([])
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const createMutation = useSubmitAddDeliveryPolicy()
  const patchMutation = usePatchDeliveryPolicy()
  const debounceTimeout = useRef<any>(null)
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const { data: deliveryPolicy, isLoading: isEditLoading } =
    useGetDeliveryPolicy(isEdit ? params.id : '')

  const { data: deliveryModeTemplates } = useFetchDeliveryModeTemplates()

  const { data: zipCodes, isSuccess } = useFetchZipCodes({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: searchInput
  })

  const form = useForm<z.infer<typeof deliveryPolicySchema>>({
    resolver: zodResolver(deliveryPolicySchema),
    values: {
      zoneName: isEdit ? deliveryPolicy?.zoneName : '',
      description: isEdit ? deliveryPolicy?.description : '',
      postalCodeType: isEdit ? deliveryPolicy?.postalCodeType : 'postalCode',
      postalCodes: isEdit ? deliveryPolicy?.postalCodes : [],
      postalCodeRanges: isEdit
        ? {
            to: String(deliveryPolicy?.postalCodeRanges?.to ?? 0) || '0',
            from: String(deliveryPolicy?.postalCodeRanges?.from ?? 0) || '0'
          }
        : { to: '0', from: '0' },
      deliverableStores: deliveryPolicy?.stores?.length ?? 0,
      isStandardDeliveryAvailable:
        deliveryPolicy?.isStandardDeliveryAvailable ?? false,
      isOneDayDeliveryAvailable:
        deliveryPolicy?.isOneDayDeliveryAvailable ?? false,
      deliveryModes: deliveryPolicy?.deliveryModes ?? {
        standard: {
          timeDurationType: deliveryPolicy,
          deliveryTime: 0,
          priceRange: [
            {
              priceFrom: 0,
              priceTo: 0,
              noLimit: false,
              deliveryCharge: 0
            }
          ]
        },
        oneDay: {
          timeDurationType: 'days',
          deliveryTime: 0,
          priceRange: [
            {
              priceFrom: 0,
              priceTo: 0,
              noLimit: false,
              deliveryCharge: 0
            }
          ]
        }
      }
    }
  })

  const {
    fields: standardFields,
    append: addStandard,
    remove: removeStandard
  } = useFieldArray({
    control: form.control,
    name: 'deliveryModes.standard.priceRange'
  })

  const {
    fields: oneDayFields,
    append: addOneDay,
    remove: removeOneDay
  } = useFieldArray({
    control: form.control,
    name: 'deliveryModes.oneDay.priceRange'
  })

  const [selectedPostalType, setSelectedPostalType] = useState<any>(
    form.getValues('postalCodeType')
  )
  const [selectedZips, setSelectedZips] = useState<any[] | undefined>(
    form.getValues('postalCodes')
  )
  const toWatch = form.watch(
    'postalCodeRanges.to',
    form.getValues('postalCodeRanges.to')
  )
  const fromWatch = form.watch(
    'postalCodeRanges.from',
    form.getValues('postalCodeRanges.from')
  )

  const debounceSelectedRange = useDebounce(
    { to: toWatch, from: fromWatch },
    1000
  )

  const postalCodeTypeWatch = form.watch(
    'postalCodeType',
    form.getValues('postalCodeType')
  )
  const postalCodesWatch = form.watch(
    'postalCodes',
    form.getValues('postalCodes')
  )

  const [selectedRange, setSelectedRange] = useState({
    to: toWatch,
    from: fromWatch
  })

  // console.log('Errors:', form.formState.errors)

  const handleSubmit = async (data: TDeliveryPolicyForm) => {
    try {
      setLoading(true)

      if (data.deliverableStores) {
        delete data.deliverableStores
      }

      console.log(data)

      if (!isEdit) {
        await createMutation.mutateAsync({
          ...data,
          postalCodeRanges: data?.postalCodeRanges
            ? {
                from: Number(data?.postalCodeRanges?.from ?? 0),
                to: Number(data?.postalCodeRanges?.to ?? 0)
              }
            : null
        })
      } else {
        await patchMutation.mutateAsync({
          data: {
            ...data,
            postalCodeRanges: data?.postalCodeRanges
              ? {
                  from: Number(data?.postalCodeRanges?.from ?? 0),
                  to: Number(data?.postalCodeRanges?.to ?? 0)
                }
              : null
          },
          deliveryPolicyId: params.id
        })
      }
      router.push(
        `/settings/deliveryPolicy?page=${page || 0}&limit=${limit || 0}`
      )
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSetDeliverableStores = (deliverableStoresCount: number) => {
    // setDeliverableStores(deliverableStoresCount)
    form.setValue('deliverableStores', deliverableStoresCount)
  }

  const cancelPress = () => {
    router.push(
      `/settings/deliveryPolicy?page=${page || 0}&limit=${limit || 0}`
    )
  }

  const handleInputChange = (value: any) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      setPagination({
        pageIndex: 0,
        pageSize: 10
      })
      setSearchInput(value)
      setZipCodes([])
    }, 1000) // 300ms debounce delay
  }

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setPagination(prev => ({
        ...prev,
        pageIndex: prev.pageIndex + 1
      }))
    }
  }

  useEffect(() => {
    setFooterContent(
      <Footer
        onSubmit={form.handleSubmit(handleSubmit)}
        loading={loading}
        onBack={cancelPress}
      />
    )
    return () => {
      setFooterContent(null)
    }
  }, [form, loading])

  useEffect(() => {
    setSelectedPostalType(postalCodeTypeWatch)
  }, [postalCodeTypeWatch])

  useEffect(() => {
    setSelectedZips(postalCodesWatch)
  }, [postalCodesWatch])

  useEffect(() => {
    setSelectedRange(debounceSelectedRange)
  }, [debounceSelectedRange])

  useEffect(() => {
    if (isSuccess && zipCodes?.data?.length > 0) {
      setZipCodes((prevZipCodes): any => {
        const newZipCodes = zipCodes?.data.filter(
          (product: any) =>
            !prevZipCodes.some(
              (prevProduct: any) => prevProduct._id === product._id
            )
        )
        return [...prevZipCodes, ...newZipCodes]
      })
    }
  }, [zipCodes, isSuccess])

  console.log(form.formState.errors)

  const DeliveryModeComponent = (mode: string) => {
    const deliveryMode: 'standard' | 'oneDay' =
      mode === 'standard' ? 'standard' : 'oneDay'

    const activeKey =
      deliveryMode == 'standard'
        ? 'isStandardDeliveryAvailable'
        : 'isOneDayDeliveryAvailable'

    const priceRange =
      deliveryMode === 'standard' ? standardFields : oneDayFields

    const hasLimit = (
      form.watch(`deliveryModes.${deliveryMode}.priceRange`) ?? []
    ).find(r => r.noLimit)

    const handleImportTemplate = (e: any) => {
      const modes = e.deliveryModes ?? null
      if (!modes) return

      const template = modes[deliveryMode] ?? {}

      form.setValue(`deliveryModes.${deliveryMode}.priceRange`, [])

      setTimeout(() => {
        form.setValue(
          `deliveryModes.${deliveryMode}.deliveryTime`,
          template.deliveryTime
        )
        form.setValue(
          `deliveryModes.${deliveryMode}.timeDurationType`,
          template.timeDurationType
        )
        form.setValue(
          `deliveryModes.${deliveryMode}.priceRange`,
          template.priceRange
        )
      })
    }

    const getFilteredModes = () => {
      if (
        !deliveryModeTemplates ||
        (deliveryModeTemplates && !deliveryModeTemplates.length)
      )
        return []

      return (deliveryModeTemplates ?? []).filter((m: any) => {
        return deliveryMode === 'standard'
          ? m.isStandardDeliveryAvailable
          : deliveryMode === 'oneDay'
            ? m.isOneDayDeliveryAvailable
            : false
      })
    }

    return (
      <div className='space-y-6 p-3'>
        <div className='flex items-center justify-between'>
          <FormSwitchField
            isSmall={true}
            name={activeKey}
            formInstance={form as any}
            label={'Delivery Option Available'}
          />

          {(getFilteredModes() ?? [])?.length > 0 && (
            <div>
              <p className='pb-1 text-sm text-label'>Import from template</p>
              <Select onValueChange={e => handleImportTemplate(e)}>
                <SelectTrigger className='w-[280px]'>
                  <SelectValue placeholder='Select Template' />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredModes()?.map((zone: any) => {
                    return (
                      <SelectItem key={zone._id} value={zone}>
                        {zone.zoneName}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {form.watch(activeKey) && (
          <div className='space-y-6'>
            <FormField
              control={form.control}
              name={`deliveryModes.${deliveryMode}.timeDurationType`}
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel className='text-sm font-medium'>
                    Expected Delivery Time Duration Type
                    <span className='text-red-600'>*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={value => {
                        field.onChange(value)
                      }}
                      value={field.value}
                      className='flex flex-row space-x-3'
                    >
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='days' />
                        </FormControl>
                        <FormLabel>Days</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='hours' />
                        </FormControl>
                        <FormLabel>Hours</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='minutes' />
                        </FormControl>
                        <FormLabel>Minutes</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              {...form.register(
                `deliveryModes.${deliveryMode}.deliveryTime` as const
              )}
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel className='text-sm font-medium'>
                    Delivery Time
                    <span className='text-red-600'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='w-full'
                      placeholder='Enter text'
                      onChange={e =>
                        field.onChange(
                          e.target.value != '' ? Number(e.target.value) : ''
                        )
                      }
                      value={field.value}
                      type='number'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <p className='pb-3 text-sm font-semibold'>Price Ranges</p>
              <div className='space-y-4'>
                {priceRange?.map((item, idx) => {
                  return (
                    <div key={idx}>
                      <div className='grid grid-cols-[1fr_2fr_1fr_50px] items-center gap-6'>
                        <FormField
                          control={form.control}
                          {...form.register(
                            `deliveryModes.${deliveryMode}.priceRange.${idx}.priceFrom` as const
                          )}
                          render={({ field }) => (
                            <FormItem className='space-y-1'>
                              <FormLabel className='text-sm font-medium'>
                                Price From
                                <span className='text-red-600'>*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className='w-full'
                                  placeholder='Enter text'
                                  onChange={e =>
                                    field.onChange(
                                      e.target.value != ''
                                        ? Number(e.target.value)
                                        : ''
                                    )
                                  }
                                  value={field.value}
                                  type='number'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='flex w-full items-end gap-3'>
                          <div className='flex-1'>
                            <FormField
                              control={form.control}
                              {...form.register(
                                `deliveryModes.${deliveryMode}.priceRange.${idx}.priceTo` as const
                              )}
                              render={({ field }) => (
                                <FormItem className='space-y-1'>
                                  <FormLabel className='flex items-center justify-between text-sm font-medium'>
                                    <div>
                                      Price To
                                      <span className='text-red-600'>*</span>
                                    </div>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      className='w-full'
                                      placeholder='Enter text'
                                      onChange={e =>
                                        field.onChange(
                                          e.target.value != ''
                                            ? Number(e.target.value)
                                            : ''
                                        )
                                      }
                                      value={field.value}
                                      type='number'
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormSwitchField
                            isSmall={true}
                            {...form.register(
                              `deliveryModes.${deliveryMode}.priceRange.${idx}.noLimit` as const
                            )}
                            formInstance={form as any}
                            label={'No Limit'}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          {...form.register(
                            `deliveryModes.${deliveryMode}.priceRange.${idx}.deliveryCharge` as const
                          )}
                          render={({ field }) => (
                            <FormItem className='space-y-1'>
                              <FormLabel className='text-sm font-medium'>
                                Delivery Charge
                                <span className='text-red-600'>*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className='w-full'
                                  placeholder='Enter text'
                                  onChange={e =>
                                    field.onChange(
                                      e.target.value != ''
                                        ? Number(e.target.value)
                                        : ''
                                    )
                                  }
                                  value={field.value}
                                  type='number'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <Trash2Icon
                            className='cursor-pointer text-red-600'
                            onClick={() => {
                              deliveryMode === 'standard'
                                ? removeStandard(idx)
                                : removeOneDay(idx)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {!hasLimit && (
                  <div className='pt-5'>
                    <Button
                      type='button'
                      variant={'outline'}
                      size={'sm'}
                      onClick={() => {
                        const payload = {
                          priceFrom: 0,
                          priceTo: 0,
                          noLimit: false,
                          deliveryCharge: 0
                        }

                        deliveryMode === 'standard'
                          ? addStandard(payload)
                          : addOneDay(payload)
                      }}
                    >
                      Add Price Range
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isEditLoading) {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    )
  }
  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            {
              page: 'Delivery Policies',
              href: `/settings/deliveryPolicy?page=${page || 0}&limit=${limit || 0}`
            },
            {
              page: isEdit
                ? deliveryPolicy?.zoneName
                : 'Add New Delivery Policy'
            }
          ]}
        />
      </div>
      <div className='p-8'>
        <Form {...form}>
          <form>
            <div className='space-y-10'>
              <div className='grid grid-cols-2 gap-10 p-2'>
                <FormField
                  control={form.control}
                  name={'zoneName'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-base font-medium'>
                        Zone Name <span className='text-red-600'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className='w-full'
                          placeholder='Enter text'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'description'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-base font-medium'>
                        Zone Description <span className='text-red-600'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className='w-full'
                          placeholder='Enter text'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'postalCodeType'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-base font-medium'>
                        Postal Code Type<span className='text-red-600'>*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={value => {
                            field.onChange(value)
                            setSelectedPostalType(value)
                          }}
                          value={field.value}
                          className='flex flex-row space-x-3'
                        >
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='postalCode' />
                            </FormControl>
                            <FormLabel>Postal Code</FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='postalCodeRange' />
                            </FormControl>
                            <FormLabel>Postal Code Range</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='postalCodes'
                  render={({ field }) => (
                    <div
                      style={{
                        display:
                          selectedPostalType == 'postalCode' ? 'block' : 'none'
                      }}
                    >
                      <FormLabel className='text-base font-medium'>
                        Zip Codes <span className='text-red-600'>*</span>
                      </FormLabel>
                      <MultiSelectInput
                        data={zipCodesD?.map((item: any) => ({
                          ...item,
                          label: `${item?.zipCode} - ${item?.area}, ${item?.district}`
                        }))}
                        labelField='label'
                        valueField='zipCode'
                        placeholder='Select Zip Codes'
                        onSelect={value => {
                          const zipCodeValue = value?.zipCode // Convert to number
                          if (field.value?.includes(zipCodeValue)) {
                            const updatedValue = field.value.filter(
                              item => item !== zipCodeValue
                            )
                            field.onChange(updatedValue)
                          } else {
                            const updatedValue = [
                              ...(field.value as any[]),
                              zipCodeValue
                            ] // Push number
                            field.onChange(updatedValue)
                          }
                        }}
                        isItemSelected={item =>
                          field.value?.includes(item.zipCode)
                            ? field.value?.includes(item.zipCode)
                            : false
                        } // Check for number
                        handleInputChange={handleInputChange}
                        handleScroll={handleScroll}
                        enableDynamicSearch={true}
                        selectedItems={
                          field.value?.length ? (
                            <div className='flex flex-wrap gap-1'>
                              {field.value?.map((zip: any, index: number) => (
                                <div
                                  key={index}
                                  className='rounded-sm bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium'
                                >
                                  {zip}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className='text-sm'>Select zip code</div>
                          )
                        }
                      />
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'postalCodeRanges.from'}
                  render={({ field }) => (
                    <div
                      style={{
                        display:
                          selectedPostalType == 'postalCodeRange'
                            ? 'block'
                            : 'none'
                      }}
                    >
                      <FormItem>
                        <FormLabel className='text-base font-medium'>
                          From <span className='text-red-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className='w-full'
                            placeholder='Enter text'
                            {...field}
                            type='number'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'postalCodeRanges.to'}
                  render={({ field }) => (
                    <div
                      style={{
                        display:
                          selectedPostalType == 'postalCodeRange'
                            ? 'block'
                            : 'none'
                      }}
                    >
                      <FormItem>
                        <FormLabel className='text-base font-medium'>
                          To <span className='text-red-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className='w-full'
                            placeholder='Enter text'
                            {...field}
                            type='number'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />
              </div>

              <div>
                <Tabs defaultValue='standard' className='w-full'>
                  <TabsList className='w-full'>
                    <TabsTrigger value='standard' className='w-1/2'>
                      Standard Delivery
                    </TabsTrigger>
                    <TabsTrigger value='oneDay' className='w-1/2'>
                      Same Delivery
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='standard'>
                    <div>{DeliveryModeComponent('standard')}</div>
                  </TabsContent>
                  <TabsContent value='oneDay'>
                    <div>{DeliveryModeComponent('oneDay')}</div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </form>
        </Form>
        <div className='h-1 w-full border-b pt-6'></div>
        <div className='border-t pt-6'>
          {selectedZips?.length ||
          (selectedRange?.to &&
            selectedRange?.to?.length >= 6 &&
            selectedRange?.from &&
            selectedRange?.from?.length >= 6) ? (
            <>
              <h1 className='text-lg font-semibold'>Zip Codes</h1>
              <ZipCodeTable
                zipCodes={selectedZips ? selectedZips : []}
                postalCodeType={selectedPostalType}
                selectedRange={
                  selectedRange
                    ? {
                        to: Number(selectedRange.to),
                        from: Number(selectedRange.from)
                      }
                    : { to: 0, from: 0 }
                }
              />
            </>
          ) : null}

          <div className='pt-6'>
            {selectedZips?.length ||
            (selectedRange?.to &&
              selectedRange?.to?.length >= 6 &&
              selectedRange?.from &&
              selectedRange?.from?.length >= 6) ? (
              <>
                <h1 className='text-lg font-semibold'>Stores</h1>
                <div>
                  {form.getFieldState('deliverableStores').error ? (
                    <p className='text-red-500'>
                      {form.getFieldState('deliverableStores').error?.message}
                    </p>
                  ) : null}
                </div>
                <StoreTable
                  onChangeDeliverableStoresCount={handleSetDeliverableStores}
                  zipCodes={selectedZips ? selectedZips : []}
                  postalCodeType={selectedPostalType}
                  selectedRange={
                    selectedRange
                      ? {
                          to: Number(selectedRange.to),
                          from: Number(selectedRange.from)
                        }
                      : { to: 0, from: 0 }
                  }
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryPolicyPage
