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
import { useFooter } from '@/context/Footer'
import { zipCodeSchema } from '@/lib/zod'
import {
  useGetZipCode,
  usePatchZipCode,
  useSubmitAddZipCode
} from '@/utils/hooks/zipCodeHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useLoadScript, StandaloneSearchBox } from '@react-google-maps/api'
import AppBreadcrumb from '@/components/Breadcrumb'
import LoadingSpinner from '@/components/LoadingSpinner'

export type TZipCodeForm = z.infer<typeof zipCodeSchema>

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

const LazyMap = dynamic(() => import('@/components/map/Map'), {
  ssr: false
})

export default function ZipCodeForm({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const isEdit = params.id == 'new' ? false : true
  const router = useRouter()
  const { data: zipCode, isLoading } = useGetZipCode(isEdit ? params.id : '')

  const { setFooterContent } = useFooter()
  const [loading, setLoading] = useState(false)

  const zipCodeMutation = useSubmitAddZipCode()
  const patchZipCodeMutation = usePatchZipCode()

  const form = useForm<z.infer<typeof zipCodeSchema>>({
    resolver: zodResolver(zipCodeSchema),
    values: {
      zipCode: isEdit ? zipCode?.zipCode : 0,
      area: isEdit ? zipCode?.area : '',
      state: isEdit ? zipCode?.state : '',
      district: isEdit ? zipCode?.district : '',
      location: isEdit
        ? zipCode?.location
        : { type: 'Point', coordinates: [77.59485, 12.971896] },
      isDeliverable: true
    }
  })

  const handleSubmit = async (data: TZipCodeForm) => {
    try {
      setLoading(true)
      if (!isEdit) {
        await zipCodeMutation.mutateAsync({
          ...data
        })
      } else {
        await patchZipCodeMutation.mutateAsync({
          zipCodeId: params.id,
          data: { ...data }
        })
      }
      router.push(`/settings/zipCodes?page=${page || 0}&limit=${limit || 0}`)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const cancelPress = () => {
    router.push(`/settings/zipCodes?page=${page || 0}&limit=${limit || 0}`)
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

  if (
    isLoading ||
    zipCodeMutation.isPending ||
    patchZipCodeMutation.isPending
  ) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Settings', href: '/settings' },
            {
              page: 'Zip Code Management',
              href: `/settings/zipCodes?page=${page || 0}&limit=${limit || 0}`
            },
            { page: isEdit ? zipCode?.zipCode : 'Add New ZipCode' }
          ]}
        />
      </div>
      <div className='pb-10 pt-3'>
        <Form {...form}>
          <form>
            <div className='space-y-10'>
              <div className='grid grid-cols-2 gap-10 p-2'>
                <FormField
                  control={form.control}
                  name={'zipCode'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Zip Code <span className='text-red-600'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className='w-full'
                          placeholder='Enter text'
                          type='number'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'area'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Area<span className='text-red-600'>*</span>
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
                  name={'district'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        District<span className='text-red-600'>*</span>
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
                  name={'state'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        State<span className='text-red-600'>*</span>
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

                <div className='col-span-2 w-full space-y-3'>
                  <AddressAutocomplete
                    onPlaceSelected={(place: any) => {
                      console.log(
                        place?.geometry?.location?.lat(),
                        ' ',
                        place?.geometry?.location?.lng()
                      )
                      form.setValue('location.coordinates', [
                        place?.geometry?.location?.lng(),
                        place?.geometry?.location?.lat()
                      ])
                    }}
                  />

                  <FormField
                    control={form.control}
                    name={'location.coordinates'}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select coordinates</FormLabel>
                        <FormMessage />
                        <FormControl>
                          <LazyMap
                            value={
                              field?.value
                                ? {
                                    lng: field?.value[0],
                                    lat: field?.value[1]
                                  }
                                : null
                            }
                            onChange={(value: any) =>
                              field.onChange([value?.lng, value?.lat])
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
