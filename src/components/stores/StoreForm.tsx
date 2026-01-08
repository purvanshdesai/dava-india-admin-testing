'use client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import MultiSelectInput from '@/components/ui/MultiSelectInput'
import { useFooter } from '@/context/Footer'
import {
  useGetStore,
  usePatchStore,
  useSubmitAddStore
} from '@/utils/hooks/storeHooks'
import {
  useFetchZipCodes,
  useGetZipDataFromZipCode
} from '@/utils/hooks/zipCodeHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import AppBreadcrumb from '@/components/Breadcrumb'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import ZipCodeTable from '@/components/deliveryPolicy/ZipCodeTable'
import { StandaloneSearchBox, useLoadScript } from '@react-google-maps/api'
import dynamic from 'next/dynamic'
import { storeSchema } from '@/lib/zod'
import { IndianStates } from '@/utils/utils/constants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import PharmacistDialog, {
  Pharmacist
} from '@/components/stores/PharmacistDialog'
import {
  useCreatePharmacist,
  useDeletePharmacist,
  useFetchPharmacists,
  usePatchPharmacist
} from '@/utils/hooks/pharmacistHooks'

const LazyMap = dynamic(() => import('@/components/map/Map'), {
  ssr: false
})

const formInputs = [
  {
    title: 'Store Information',
    inputs: [
      {
        name: 'storeName',
        label: 'Store Name',
        props: {
          placeholder: 'Enter store name'
        }
      },
      {
        name: 'gstNumber',
        label: 'GST Number',
        props: {
          placeholder: 'Enter Gst number'
        }
      },
      {
        name: 'licenceNumber',
        label: 'License Number',
        props: {
          placeholder: 'Enter license number'
        }
      },
      {
        name: 'fssaiNumber',
        label: 'FSSAI Number',
        props: {
          placeholder: 'Enter FSSAI number'
        }
      },
      {
        name: 'storeCode',
        label: 'Store Code',
        props: {
          placeholder: 'Enter store code'
        }
      }
    ]
  },
  {
    title: 'Contact Information',
    inputs: [
      {
        name: 'email',
        label: 'Email address',
        props: {
          placeholder: 'Enter email address'
        }
      },
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        props: {
          type: 'tel',
          placeholder: 'Enter phone number'
        }
      }
    ]
  }
]

const formAddressInputs = [
  {
    title: 'Address Information',
    inputs: [
      {
        name: 'pincode',
        label: 'Pin code',
        props: {
          type: 'number',
          placeholder: 'Enter pin code'
        }
      },
      {
        name: 'city',
        label: 'City',
        props: {
          placeholder: 'Select city'
        }
      },
      {
        name: 'state',
        label: 'State',
        props: {
          placeholder: 'Select state'
        }
      },
      {
        name: 'address',
        label: 'Address',
        props: {
          placeholder: 'Enter address'
        }
      }
    ]
  }
]

export type TStoreForm = z.infer<typeof storeSchema>

const Footer = ({
  onSubmit,
  onBack,
  submitting = false
}: {
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
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
        disabled={submitting}
        className={'w-24 text-center'}
        onClick={onSubmit}
      >
        {submitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
        Save
      </Button>
    </div>
  )
}

export default function StoreForm({ params }: { params: { storeId: string } }) {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const { toast } = useToast()
  const isEdit = params.storeId == 'new' ? false : true
  const debounceTimeout = useRef<any>(null)
  const [searchInput, setSearchInput] = useState('')
  const [zipCodesD, setZipCodes] = useState([])
  const [pharmacists, setPharmacists] = useState<any[]>([])
  const pharmacistsRef = useRef<Pharmacist[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [deletedPharmacistIds, setDeletedPharmacistIds] = useState<string[]>([])
  const deletedPharmacistIdsRef = useRef<string[]>([])

  const { setFooterContent } = useFooter()
  const { data: store, isLoading } = useGetStore(isEdit ? params.storeId : '')
  const { data: storePharmacists } = useFetchPharmacists(
    isEdit ? params?.storeId : ''
  )

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const { data: zipCodes, isSuccess } = useFetchZipCodes({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: searchInput
  })
  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    values: {
      storeName: isEdit ? store?.storeName : undefined,
      gstNumber: isEdit ? store?.gstNumber : undefined,
      fssaiNumber: isEdit ? store?.fssaiNumber : undefined,
      licenceNumber: isEdit ? store?.licenceNumber : undefined,
      storeCode: isEdit ? store?.storeCode : undefined,
      email: isEdit ? store?.email : undefined,
      phoneNumber: isEdit ? store?.phoneNumber : '',
      city: isEdit ? store?.city : undefined,
      state: isEdit ? store?.state : undefined,
      pincode: isEdit ? store?.pincode : undefined,
      address: isEdit ? store?.address : undefined,
      serviceableZip: isEdit ? store?.serviceableZip : [],
      coordinates: isEdit
        ? (store?.coordinates ?? { longitude: 77.043908, latitude: 13.805108 })
        : { longitude: 77.043908, latitude: 13.805108 }
    }
  })

  const pinCodeWatch = form.watch('pincode')
  const cityWatch = form.watch('city')
  const stateWatch = form.watch('state')
  const serviceableZipWatch = form.watch('serviceableZip')

  const { data: zipCodeInfo } = useGetZipDataFromZipCode(pinCodeWatch)

  const addStoreMutation = useSubmitAddStore()
  const patchStoreMutation = usePatchStore()

  const { mutateAsync: addPharmacist } = useCreatePharmacist()
  const { mutateAsync: updatePharmacist } = usePatchPharmacist()
  const { mutateAsync: deletePharmacist } = useDeletePharmacist()

  const router = useRouter()

  const submitAddStore = async (values: z.infer<typeof storeSchema>) => {
    try {
      const trimmedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => {
          if (typeof value === 'string') {
            return [key, value.trim()]
          }
          return [key, value]
        })
      )

      let storeId: any
      if (isEdit) {
        const res = await patchStoreMutation.mutateAsync({
          storeId: params.storeId,
          data: {
            ...trimmedValues,
            serviceableZip: values.serviceableZip.map((zip: any) => Number(zip))
          }
        })
        storeId = res?._id
      } else {
        const res = await addStoreMutation.mutateAsync({
          ...trimmedValues,
          serviceableZip: values.serviceableZip.map((zip: any) => Number(zip))
        })
        storeId = res?._id
      }

      for (const pharmacist of pharmacistsRef.current as any) {
        const payload = {
          ...pharmacist,
          store: storeId
        }

        if (pharmacist?._id) {
          await updatePharmacist(payload) // PATCH
        } else {
          await addPharmacist(payload) // POST
        }
      }

      for (const id of deletedPharmacistIdsRef.current) {
        try {
          await deletePharmacist(id)
        } catch (err) {
          throw err
        }
      }

      router.push(`/stores?page=${page || 0}&limit=${limit || 10}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message
      })
      throw error
    }
  }
  const cancelPress = () => {
    router.push(`/stores?page=${page || 0}&limit=${limit || 10}`)
  }

  useEffect(() => {
    setFooterContent(
      <Footer
        onSubmit={form.handleSubmit(submitAddStore)}
        onBack={cancelPress}
        submitting={addStoreMutation.isPending || patchStoreMutation.isPending}
      />
    )
    return () => {
      setFooterContent(null)
    }
  }, [])

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
    if (zipCodeInfo) {
      if (zipCodeInfo?.state) {
        if (!stateWatch) {
          const state = IndianStates.find(
            item => item.name.toUpperCase() == zipCodeInfo?.state?.toUpperCase()
          )
          if (state?.name) {
            form.setValue('state', state?.name)
          }
        }
        if (zipCodeInfo?.district) {
          if (!cityWatch) {
            form.setValue('city', zipCodeInfo?.district)
          }
        }
      }
    }
  }, [zipCodeInfo])

  const handleAddOrUpdatePharmacist = (data: Pharmacist) => {
    setPharmacists(prev => {
      let updated: Pharmacist[]

      if (editingIndex !== null) {
        updated = [...(prev ?? [])]
        updated[editingIndex] = {
          ...(prev[editingIndex] ?? {}),
          ...data
        }
      } else {
        updated = [...(prev ?? []), data]
      }

      pharmacistsRef.current = updated // Keep ref in sync
      return updated
    })

    setEditingIndex(null)
  }

  const handleInputChange = (value: any) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      setSearchInput(value)
      setPagination({
        pageIndex: 0,
        pageSize: 10
      })
      setZipCodes([])
    }, 1000) // 300ms debounce delay
  }

  const AddressAutocomplete = ({ onPlaceSelected }: any) => {
    const { isLoaded, loadError } = useLoadScript({
      googleMapsApiKey: process.env
        .NEXT_PUBLIC_GOOGLE_MAP_API as unknown as string,
      libraries: ['places']
    })

    const searchBoxRef = useRef<any>(null)
    const [address, setAddress] = useState('')

    const handlePlacesChanged = useCallback(() => {
      const places = searchBoxRef.current.getPlaces()
      if (places && places.length > 0) {
        onPlaceSelected(places[0])
        setAddress(places[0].formatted_address)
      }
    }, [onPlaceSelected])

    if (loadError) return <div>Error loading maps</div>
    if (!isLoaded) return <div>Loading maps</div>

    return (
      <div className='flex flex-col space-y-5'>
        <StandaloneSearchBox
          onLoad={ref => (searchBoxRef.current = ref)}
          onPlacesChanged={handlePlacesChanged}
        >
          <Input
            placeholder='Enter your address'
            value={address}
            onChange={(e: {
              target: { value: React.SetStateAction<string> }
            }) => setAddress(e.target.value)}
            className='w-full rounded border border-gray-300 p-2'
            name={'address'}
          />

          {/* <FormTextField
            label={"Address*"}
            value={address}
            placeholder={"Address"}
            name={"address"}
            onChange={(e: {
              target: { value: React.SetStateAction<string> };
            }) => setAddress(e.target.value)}
          /> */}
        </StandaloneSearchBox>
      </div>
    )
  }

  useEffect(() => {
    pharmacistsRef.current = storePharmacists
  }, [storePharmacists])

  useEffect(() => {
    setPharmacists(storePharmacists)
  }, [storePharmacists])

  useEffect(() => {
    deletedPharmacistIdsRef.current = deletedPharmacistIds
  }, [deletedPharmacistIds])

  return (
    <div className='relative h-full'>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Stores', href: '/stores' },
            {
              page: isEdit ? (store?.storeName ?? '') : 'Add New Store'
            }
          ]}
        />
      </div>

      <div className='pt-6'>
        {isEdit && isLoading ? (
          <div>Loading</div>
        ) : (
          <Form {...form}>
            <form className='pb-10'>
              <div className='space-y-10'>
                {formInputs.map((inputsData, index) => (
                  <div key={index}>
                    <header className='text-lg font-semibold'>
                      {inputsData.title}
                    </header>
                    <div className='grid grid-cols-2 gap-10 p-2'>
                      {inputsData.inputs.map((inputData: any, index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name={inputData.name}
                          render={({ field }) => (
                            <div>
                              {inputData?.name == 'state' ? (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder='Select state' />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {IndianStates.map(
                                        (state: any, index: number) => (
                                          <SelectItem
                                            key={index}
                                            value={state.name}
                                          >
                                            {state.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              ) : inputData?.name != 'phoneNumber' ? (
                                <FormItem>
                                  <FormLabel className='text-sm font-medium'>
                                    {inputData.label}

                                    <span className='text-red-600'>*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      disabled={
                                        inputData.name == 'email' && isEdit
                                      }
                                      className='w-full'
                                      {...field}
                                      {...inputData?.props}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              ) : (
                                <FormItem>
                                  <FormLabel className='text-sm font-medium'>
                                    {inputData.label}
                                    <span className='text-red-600'>*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className='relative'>
                                      <Input
                                        className='w-full pl-10'
                                        placeholder='Enter phone number'
                                        value={field.value}
                                        onChange={e => {
                                          if (/^\d*$/.test(e.target.value)) {
                                            field.onChange(e.target.value)
                                          }
                                        }}
                                      />
                                      <div className='absolute left-2 top-2'>
                                        +91
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <header className='flex items-center justify-between text-lg font-semibold'>
                    Pharmacist Details
                    <PharmacistDialog
                      onSave={handleAddOrUpdatePharmacist}
                      triggerButton={<Button>Add New Pharmacist</Button>}
                    />
                  </header>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className=''>Pharmacist Name</TableHead>
                        <TableHead>Employee Id</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Pin</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pharmacists?.map((pharmacist, index) => (
                        <TableRow key={index}>
                          <TableCell className='font-medium'>
                            {pharmacist?.name}
                          </TableCell>
                          <TableCell>{pharmacist?.employeeId}</TableCell>
                          <TableCell>{pharmacist?.phoneNumber}</TableCell>
                          <TableCell>{pharmacist?.pin}</TableCell>
                          <TableCell className='space-x-2 text-right'>
                            <PharmacistDialog
                              initialData={pharmacist}
                              isEdit={true}
                              onSave={handleAddOrUpdatePharmacist}
                              triggerButton={
                                <Button
                                  variant='ghost'
                                  onClick={() => setEditingIndex(index)}
                                >
                                  Edit
                                </Button>
                              }
                            />
                            <Button
                              variant='destructive'
                              onClick={() => {
                                const pharmacist = pharmacists[index]

                                if (pharmacist._id) {
                                  setDeletedPharmacistIds(prev => {
                                    const updated = [...prev, pharmacist._id]
                                    deletedPharmacistIdsRef.current = updated // ✅ Sync ref
                                    return updated
                                  })
                                }

                                setPharmacists(prev =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <header className='text-lg font-semibold'>
                    Serviceable Zip codes
                  </header>
                  <div className='grid grid-cols-2 gap-10 p-2'>
                    <FormField
                      control={form.control}
                      name='serviceableZip'
                      render={({ field }) => (
                        <div>
                          <FormLabel className='pb-2 text-sm font-medium'>
                            Zip Code
                            <span className='text-red-600'>*</span>
                          </FormLabel>
                          <MultiSelectInput
                            data={zipCodesD?.map((item: any) => ({
                              ...item,
                              label: `${item?.zipCode} - ${item?.area}, ${item?.district}`
                            }))}
                            labelField='label'
                            valueField='zipCode'
                            placeholder='Select zip codes'
                            onSelect={value => {
                              if (
                                field.value?.find(
                                  fieldVal => fieldVal == value?.zipCode
                                )
                              ) {
                                field.onChange(
                                  field.value.filter(
                                    item => item != value?.zipCode
                                  )
                                )
                              } else {
                                field.onChange([...field.value, value?.zipCode])
                              }
                            }}
                            isItemSelected={item =>
                              field.value?.find(
                                fieldVal => fieldVal == item?.zipCode
                              )
                            }
                            // selectedItems={field.value
                            //   ?.map((zip: any) => zip)
                            //   .join(', ')}
                            handleInputChange={handleInputChange}
                            handleScroll={handleScroll}
                            enableDynamicSearch={true}
                            selectedItems={
                              field.value?.length ? (
                                <div className='flex flex-wrap gap-1'>
                                  {field.value?.map(
                                    (zip: any, index: number) => (
                                      <div
                                        key={index}
                                        className='rounded-sm bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium dark:bg-gray-900'
                                      >
                                        {zip}
                                      </div>
                                    )
                                  )}
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
                  </div>
                  {serviceableZipWatch?.length ? (
                    <div className='pl-2'>
                      <h1 className='py-3'>Selected Serviceable Zip Codes</h1>
                      <ZipCodeTable
                        zipCodes={serviceableZipWatch}
                        postalCodeType={'postalCode'}
                        selectedRange={{ to: 0, from: 0 }}
                      />
                    </div>
                  ) : null}
                </div>

                {formAddressInputs.map((inputsData, index) => (
                  <div key={index}>
                    <header className='text-lg font-semibold'>
                      {inputsData.title}
                    </header>
                    <div className='grid grid-cols-2 gap-10 p-2'>
                      {inputsData.inputs.map((inputData: any, index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name={inputData.name}
                          render={({ field }) => (
                            <div>
                              {inputData?.name == 'state' ? (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder='Select state' />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {IndianStates.map(
                                        (state: any, index: number) => (
                                          <SelectItem
                                            key={index}
                                            value={state.name}
                                          >
                                            {state.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              ) : inputData?.name != 'phoneNumber' ? (
                                <FormItem>
                                  <FormLabel className='text-sm font-medium'>
                                    {inputData.label}
                                    <span className='text-red-600'>*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      className='w-full'
                                      {...field}
                                      {...inputData?.props}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              ) : (
                                <FormItem>
                                  <FormLabel className='text-sm font-medium'>
                                    {inputData.label}
                                    <span className='text-red-600'>*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className='relative'>
                                      <Input
                                        className='w-full pl-10'
                                        placeholder='Enter phone number'
                                        value={field.value}
                                        onChange={e => {
                                          if (/^\d*$/.test(e.target.value)) {
                                            field.onChange(e.target.value)
                                          }
                                        }}
                                      />
                                      <div className='absolute left-2 top-2'>
                                        +91
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <div className='col-span-2 w-full space-y-3'>
                  <AddressAutocomplete
                    onPlaceSelected={(place: any) => {
                      form.setValue('coordinates', {
                        longitude: place?.geometry?.location?.lng(),
                        latitude: place?.geometry?.location?.lat()
                      })
                    }}
                  />

                  <FormField
                    control={form.control}
                    name={'coordinates'}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select coordinates</FormLabel>
                        <div className='text-xs text-red-600'>
                          {form.formState.errors?.coordinates && (
                            <div>
                              Store Longitude and latitude is required!{' '}
                            </div>
                          )}
                        </div>
                        <FormControl>
                          <LazyMap
                            value={
                              field?.value
                                ? {
                                    lng: field?.value?.longitude,
                                    lat: field?.value?.latitude
                                  }
                                : null
                            }
                            onChange={(value: any) =>
                              field.onChange({
                                longitude: value?.lng,
                                latitude: value?.lat
                              })
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
