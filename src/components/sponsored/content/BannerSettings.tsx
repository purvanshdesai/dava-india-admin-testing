'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { sponsoredLayoutBannerSchema } from '@/lib/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInputField from '@/components/form/FormInputField'
import FormDatePicker from '@/components/form/FormDatePicker'
import FormSwitchField from '@/components/form/FormSwitchField'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import ImageUpload from '@/components/form/ImageUpload'
import AppBreadcrumb from '@/components/Breadcrumb'
import { removeFiles, uploadFiles } from '@/utils/utils/fileUpload'
import {
  createSponsoredBanner,
  updateSponsoredBanner,
  fetchSponsoredBannerById,
  deleteSponsoredBanner
} from '@/utils/actions/sponsoredBannerActions'
import { deleteSponsorLayout } from '@/utils/actions/sponsoredActions'
import FormDialog from '@/components/form/FormDialogBox'
import CategoryTranslationForm from '@/components/category/CategoryTranslationForm'
import { Languages } from 'lucide-react'
import { DialogClose } from '@radix-ui/react-dialog'
import { useGetSupportedLanguages } from '@/utils/hooks/appDataHooks'
import FormSelectField from '@/components/form/FormSelectField'
import FormComboboxField from '@/components/form/FormComboboxField'
import { useGetAllCollections } from '@/utils/hooks/collectionsHooks'

export type TSectionForm = z.infer<typeof sponsoredLayoutBannerSchema>

export default function SponsoredLayoutSettings() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams() as any

  const layoutType: string = searchParams.get('type') ?? ''
  const bannerId = params?.bannerId
  const { data: languages }: any = useGetSupportedLanguages({})

  const [loading, setLoading] = useState(false)
  const [desktopImage, setDesktopImage] = useState<any>({
    newFile: null,
    removedFile: null
  })
  // const [tabletImage, setTabletImage] = useState<any>({
  //   newFile: null,
  //   removedFile: null
  // })
  const [mobileImage, setMobileImage] = useState<any>({
    newFile: null,
    removedFile: null
  })
  const [bannerData, setBannerData] = useState<any>({})
  const [showNameTranslation, setShowNameTranslation] = useState(false)

  const [showDescriptionTranslation, setShowDescriptionTranslation] =
    useState(false)
  // form schema
  const form = useForm<z.infer<typeof sponsoredLayoutBannerSchema>>({
    resolver: zodResolver(sponsoredLayoutBannerSchema),
    values: {
      title: '',
      type: layoutType ?? '',
      startDate: null,
      endDate: null,
      isActive: true,
      device: {
        desktop: '',
        tablet: '',
        mobile: ''
      },
      translations: {
        title: {
          en: '',
          bn: '',
          gu: '',
          hi: '',
          kn: '',
          ml: '',
          mr: '',
          or: '',
          pa: '',
          ta: '',
          te: '',
          as: '',
          ne: '',
          boj: ''
        }
      },
      properties: {
        redirectType: 'collection',
        collection: null,
        redirectUrl: ''
      }
    }
  })

  const formInstance = form as unknown as UseFormReturn

  // console.log(form.getValues())
  const { data: collectionsData } = useGetAllCollections()

  const typeOfRedirection = form.watch('properties.redirectType')
  // form reset when edit
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (bannerId === 'new') return

        const banner = await fetchSponsoredBannerById(bannerId)
        setBannerData(banner)

        const convertedData = {
          ...banner,
          startDate: banner?.startDate ? new Date(banner?.startDate) : null,
          endDate: banner?.endDate ? new Date(banner?.endDate) : null
        }

        form.reset(convertedData)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [bannerId !== 'new'])

  // submit function for form
  const handleSubmitForm = async () =>
    // values: z.infer<typeof sponsoredLayoutBannerSchema> | any
    {
      try {
        setLoading(true)
        const { device, ...rest } = form.getValues()

        const updatedBanner = await handleImageUpload()

        const payload = {
          type: layoutType,
          sponsoredId:
            layoutType == 'image'
              ? bannerId == 'new'
                ? '673d5cc88d80600b4c6e3901'
                : rest?.sponsoredId // dummy
              : params?.sponsorId,
          title: rest?.title,
          startDate: rest?.startDate,
          endDate: rest?.endDate,
          isActive: rest?.isActive,
          device: { ...device, ...updatedBanner },
          properties: {
            redirectType: rest?.properties?.redirectType,
            collection:
              rest?.properties?.collection !== ''
                ? rest?.properties?.collection
                : null,
            redirectUrl: rest?.properties?.redirectUrl
          },
          translations: rest?.translations
        }
        if (bannerId !== 'new') {
          await updateSponsoredBanner({ _id: bannerId, ...payload })
          toast({
            title: 'Success',
            description: 'Updated successfully'
          })
        } else {
          await createSponsoredBanner(payload)
          toast({
            title: 'Success',
            description: 'Created successfully'
          })
        }
        goBack()
      } catch (error) {
        console.log(error, 'error')
      } finally {
        setLoading(false)
      }
    }

  const goBack = () => {
    router.push(`/sponsored-layout/${params?.sponsorId}?type=${layoutType}`)
  }

  const handleImageUpload = async () => {
    const platforms = [
      { type: 'desktop', file: desktopImage },
      // { type: 'tablet', file: tabletImage },
      { type: 'mobile', file: mobileImage }
    ].reduce((acc: any, { type, file: f }) => {
      if (f.newFile || f.removedFile) acc.push({ type, f })
      return acc
    }, [])

    const result = await Promise.all(
      platforms.map(async ({ type, f }: { type: string; f: any }) => {
        try {
          let imageUrl = ''
          const { newFile, removedFile } = f

          if (removedFile) {
            await removeFiles([removedFile?.url])
            imageUrl = ''
          }

          if (newFile) {
            const [image] = await uploadFiles([newFile])
            imageUrl = image?.objectUrl
          }

          return { [type]: { imageUrl } }
        } catch (e) {
          return { [type]: '' }
        }
      })
    )

    return result.reduce((acc, r) => ({ ...acc, ...r }), {})
  }

  // Delete Banner
  const handleDeleteBanner = async () => {
    await deleteSponsoredBanner(bannerData?._id)

    try {
      const imageUrls: Array<string> = (
        Object.values(bannerData?.banner) ?? []
      )?.reduce((acc: Array<string>, f: any) => {
        if (f && f.imageUrl) acc.push(f.imageUrl)
        return acc
      }, [])

      await removeFiles(imageUrls)
    } catch (e) {
      console.log(e)
    }

    await deleteSponsorLayout(params?.sponsorId)

    router.back()
  }

  const getImage = (device: 'desktop' | 'tablet' | 'mobile') => {
    const data = form.getValues(`device.${device}`)

    return !data || (data && data?.isNewFile) ? [] : [data?.imageUrl]
  }

  const hideDesktopUpload = form.getValues('device.desktop') != ''
  // const hideTabletUpload = form.getValues('device.tablet') != ''
  const hideMobileUpload = form.getValues('device.mobile') != ''
  const toggleNameTranslation: any = () => {
    if (showDescriptionTranslation) setShowDescriptionTranslation(false)
    setShowNameTranslation(!showNameTranslation)
  }
  return (
    <div className='h-full'>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Sponsored', href: '/sponsored-layout' },
            {
              page: 'Layout Settings',
              href: `/sponsored-layout/${params?.sponsorId}?type=${layoutType}`
            },
            {
              page: 'Banner Settings'
            }
          ]}
        />
      </div>
      <div>
        <div className='mt-4'>
          <div className='grid h-full grid-cols-[400px_1fr] gap-4'>
            <div className='h-full rounded-md border p-4'>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmitForm)}
                  className='flex h-full flex-col justify-between'
                >
                  <div className='flex flex-col gap-3'>
                    <div>
                      <div className='grid gap-8'>
                        <div className='flex flex-row items-center gap-4'>
                          <div className='flex-1'>
                            <FormInputField
                              formInstance={formInstance}
                              name={'title'}
                              label={'Layout Title'}
                              placeholder={'Enter Layout Title'}
                              isSmall={true}
                              isReq={true}
                              className='w-full'
                            />
                          </div>

                          <div>
                            {
                              <FormDialog
                                content={
                                  <CategoryTranslationForm
                                    type='title'
                                    formInstance={formInstance}
                                    translationValues={languages?.sort(
                                      (a: any, b: any) =>
                                        a?.name?.localeCompare(b.name)
                                    )}
                                    translationFor='layout title'
                                  />
                                }
                                trigger={
                                  <div
                                    className='mt-8 cursor-pointer rounded-lg border-2 border-primary p-2'
                                    onClick={toggleNameTranslation}
                                  >
                                    <Languages
                                      className='text-primary'
                                      size={20}
                                    />
                                  </div>
                                }
                                title={'Layout Translation2'}
                                footerActions={() => (
                                  <div className='flex items-center gap-3'>
                                    <DialogClose>
                                      <Button
                                        variant='secondary'
                                        onClick={() => form.reset()}
                                      >
                                        Cancel
                                      </Button>
                                    </DialogClose>
                                    <DialogClose>
                                      <Button>Save</Button>
                                    </DialogClose>
                                  </div>
                                )}
                              />
                            }
                          </div>
                        </div>

                        <FormSelectField
                          formInstance={form as unknown as UseFormReturn}
                          isSmall={true}
                          isReq={true}
                          label={'Redirect Type'}
                          name={'properties.redirectType'}
                          placeholder={'Select Type'}
                          items={[
                            { value: 'collection', label: 'Collection' },
                            { value: 'externalLink', label: 'External Link' },
                            { value: 'none', label: 'None' }
                          ]}
                        />

                        {typeOfRedirection !== 'none' &&
                          typeOfRedirection == 'collection' && (
                            <FormComboboxField
                              multiple={false}
                              isSmall={true}
                              formInstance={form as unknown as UseFormReturn}
                              label={'Collection'}
                              name={'properties.collection'}
                              items={(collectionsData ?? [])?.map((c: any) => ({
                                label: c.name,
                                value: c._id
                              }))}
                              className={'w-full'}
                            />
                          )}

                        {typeOfRedirection !== 'none' &&
                          typeOfRedirection == 'externalLink' && (
                            <FormInputField
                              formInstance={formInstance}
                              name={'properties.redirectUrl'}
                              label={'Redirect URL'}
                              placeholder={'Enter Redirect URL'}
                              isSmall={true}
                              isReq={true}
                            />
                          )}

                        <FormDatePicker
                          formInstance={form as unknown as UseFormReturn}
                          label='Start Date'
                          name='startDate'
                          placeholder='Select a date'
                          isSmall={true}
                          showRadioOption={true}
                        />
                        <FormDatePicker
                          formInstance={form as unknown as UseFormReturn}
                          label='Expiry Date'
                          name='endDate'
                          placeholder='Select a date'
                          isSmall={true}
                          showRadioOption={true}
                        />
                        <FormSwitchField
                          isSmall={true}
                          name={'isActive'}
                          formInstance={form as unknown as UseFormReturn}
                          label={'Active'}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='sticky bottom-0 left-0 w-full'>
                    <div className='flex justify-end gap-[20px]'>
                      <Button
                        type='button'
                        variant={'outline'}
                        className={'w-24'}
                        onClick={() => handleDeleteBanner()}
                      >
                        Delete
                      </Button>

                      <Button
                        type='button'
                        variant={'outline'}
                        className={'w-24'}
                        onClick={() => goBack()}
                      >
                        Close
                      </Button>
                      <Button
                        type='submit'
                        loader={loading}
                        className={'w-24 text-center'}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
            <div
              className='w-full overflow-y-auto rounded-md border bg-gray-50 p-4'
              style={{ height: 'calc(100vh - 100px)' }}
            >
              <div className='space-y-4'>
                <div className='rounded-md border bg-white p-3'>
                  <p className='text-sm font-semibold'>
                    Desktop
                    {form.formState.errors &&
                      form.formState.errors?.device &&
                      form.formState.errors?.device?.desktop && (
                        <span className='px-3 text-xs text-red-600'>
                          Desktop Image is required
                        </span>
                      )}
                  </p>

                  <div className='pt-3'>
                    <ImageUpload
                      existingFiles={getImage('desktop')}
                      imageContainerStyle={''}
                      imageStyle={'w-full'}
                      hideSelect={hideDesktopUpload}
                      allowedAspectRatio={
                        layoutType == 'carousel-mini' ? [659, 284] : [5.25, 1]
                      }
                      onUploadNewFiles={(
                        file: Array<File>,
                        removedFile: any
                      ) => {
                        const nFile = Array.isArray(file) ? file[0] : file
                        setDesktopImage({
                          newFile: nFile,
                          removedFile: removedFile ?? desktopImage.removedFile
                        })

                        form.setValue('device.desktop', nFile)
                      }}
                      onRemoveFile={(res: File) => {
                        setDesktopImage({ ...desktopImage, removedFile: res })
                        form.setValue('device.desktop', '')
                      }}
                      onRemoveNewFile={() => {
                        setDesktopImage({ ...desktopImage, newFile: null })
                        form.setValue('device.desktop', '')
                      }}
                    />

                    <p className='pt-2 text-xs text-label'>
                      {layoutType == 'carousel-mini'
                        ? 'Size: 659x284'
                        : 'Size: 1680x320, Aspect Ratio: 5.25:1'}
                    </p>
                  </div>
                </div>
                {/* <div className='rounded-md border bg-white p-3'>
                  <p className='text-sm font-semibold'>Tablet</p>
                  <div className='pt-3'>
                    <ImageUpload
                      existingFiles={getImage('tablet')}
                      imageContainerStyle={''}
                      imageStyle={'w-full'}
                      hideSelect={hideTabletUpload}
                      allowedAspectRatio={[2, 1]}
                      onUploadNewFiles={(
                        file: Array<File>,
                        removedFile: any
                      ) => {
                        const nFile = Array.isArray(file) ? file[0] : file
                        setTabletImage({
                          newFile: nFile,
                          removedFile: removedFile ?? tabletImage.removedFile
                        })

                        form.setValue('device.tablet', nFile)
                      }}
                      onRemoveFile={(res: File) => {
                        setTabletImage({ ...tabletImage, removedFile: res })
                        form.setValue('device.tablet', '')
                      }}
                      onRemoveNewFile={() => {
                        setTabletImage({ ...tabletImage, newFile: null })
                        form.setValue('device.tablet', '')
                      }}
                    />

                    <p className='pt-2 text-xs text-label'>
                      Size: 659x284, Aspect Ratio: 2:1
                    </p>
                  </div>
                </div> */}
                <div className='rounded-md border bg-white p-3'>
                  <p className='text-sm font-semibold'>
                    Mobile & Tablet
                    {form.formState.errors &&
                      form.formState.errors?.device &&
                      form.formState.errors?.device?.mobile && (
                        <span className='px-3 text-xs text-red-600'>
                          Mobile & Tablet Image is required
                        </span>
                      )}
                  </p>
                  <div className='pt-3'>
                    <ImageUpload
                      existingFiles={getImage('mobile')}
                      imageContainerStyle={''}
                      imageStyle={'w-full'}
                      hideSelect={hideMobileUpload}
                      allowedAspectRatio={
                        layoutType == 'carousel-mini' ? [659, 284] : [2, 1]
                      }
                      onUploadNewFiles={(
                        file: Array<File>,
                        removedFile: any
                      ) => {
                        const nFile = Array.isArray(file) ? file[0] : file
                        setMobileImage({
                          newFile: nFile,
                          removedFile: removedFile ?? mobileImage.removedFile
                        })

                        form.setValue('device.mobile', nFile)
                      }}
                      onRemoveFile={(res: File) => {
                        console.log(res)
                        setMobileImage({ ...mobileImage, removedFile: res })
                        form.setValue('device.mobile', '')
                      }}
                      onRemoveNewFile={() => {
                        setMobileImage({ ...mobileImage, newFile: null })
                        form.setValue('device.mobile', '')
                      }}
                    />

                    <p className='pt-2 text-xs text-label'>
                      {layoutType == 'carousel-mini'
                        ? 'Size: 659x284'
                        : 'Size: 656x328, Aspect Ratio: 2:1'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
