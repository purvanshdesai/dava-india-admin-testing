import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import { sponsoredLayoutSchema } from '@/lib/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInputField from '@/components/form/FormInputField'
import FormDatePicker from '@/components/form/FormDatePicker'
import FormSwitchField from '@/components/form/FormSwitchField'
import { toast } from '@/hooks/use-toast'
import {
  createSponsoredLayout,
  updateSponsorLayout,
  fetchSponsorDetailById,
  deleteSponsorLayout
} from '@/utils/actions/sponsoredActions'
import { deleteSponsoredBanner } from '@/utils/actions/sponsoredBannerActions'
import Image from 'next/image'
import { removeFiles } from '@/utils/utils/fileUpload'
import FormDialog from '@/components/form/FormDialogBox'
import CategoryTranslationForm from '@/components/category/CategoryTranslationForm'
import { Languages } from 'lucide-react'
import { DialogClose } from '@radix-ui/react-dialog'
import { useGetSupportedLanguages } from '@/utils/hooks/appDataHooks'
import FormRadioButton from '@/components/form/FormRadioButton'

export type TSectionForm = z.infer<typeof sponsoredLayoutSchema>

export default function BannerLayout() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const sponsorId = params?.sponsorId as string
  const [showNameTranslation, setShowNameTranslation] = useState(false)
  const layoutType = searchParams.get('type')
  const [loading, setLoading] = useState(false)
  const [sponsoredBanners, setSponsoredBanners] = useState<Array<any>>([])
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const { data: languages }: any = useGetSupportedLanguages({})
  const [showDescriptionTranslation, setShowDescriptionTranslation] =
    useState(false)
  // form schema
  const form = useForm<z.infer<typeof sponsoredLayoutSchema>>({
    resolver: zodResolver(sponsoredLayoutSchema),
    values: {
      title: '',
      type: layoutType ?? '',
      startDate: null,
      endDate: null,
      isActive: true,
      properties: {
        autoScroll: false,
        scrollTime: 0
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
      }
    }
  })

  const formInstance = form as unknown as UseFormReturn

  const isAutoScroll = form.watch('properties.autoScroll')

  // form reset when edit
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (sponsorId === 'new') return

        const settings = await fetchSponsorDetailById(sponsorId)

        const { banners, ...rest } = settings

        const convertedData = {
          ...rest,
          startDate: rest?.startDate ? new Date(rest?.startDate) : null,
          endDate: rest?.endDate ? new Date(rest?.endDate) : null
        }

        form.reset(convertedData)

        setSponsoredBanners(banners ?? [])
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [sponsorId !== 'new'])

  const handleBannerNavigation = async (bannerId = null) => {
    let sponsoredId = sponsorId
    const formData = form.getValues()

    const result = sponsoredLayoutSchema.safeParse(formData)

    if (!result.success) {
      if (buttonRef.current) buttonRef.current.click()

      toast({
        title: 'Invalid Form data',
        description: 'Please add form data!'
      })
      return
    } else if (sponsorId === 'new') {
      const res: any = await handleSubmitForm(form.getValues(), false)
      sponsoredId = res?._id
    }

    router.push(
      `/sponsored-layout/${sponsoredId}/${bannerId != null ? bannerId : 'new'}?type=${layoutType}`
    )
  }

  // submit function for form
  const handleSubmitForm = async (
    values: z.infer<typeof sponsoredLayoutSchema> | any,
    redirect: boolean = true
  ) => {
    try {
      setLoading(true)
      let layout

      const payload = { ...values }
      console.log('payload', payload)

      if (sponsorId !== 'new') {
        layout = await updateSponsorLayout({
          _id: sponsorId,
          ...payload,
          translations: {
            ...payload.translations,
            title: {
              ...payload.translations.title,
              en: payload.title
            }
          }
        })
        toast({
          title: 'Success',
          description: 'Updated successfully'
        })
      } else {
        layout = await createSponsoredLayout(payload)
        toast({
          title: 'Success',
          description: 'Created successfully'
        })
      }

      if (redirect) router.push('/sponsored-layout')

      return layout
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Delete Layout
  const handleDelete = async () => {
    await deleteSponsorLayout(sponsorId)
    router.back()
  }

  // Delete Banner
  const handleDeleteBanner = async (banner: any) => {
    await deleteSponsoredBanner(banner?._id)
    setSponsoredBanners(state => state.filter(b => b._id !== banner?._id))

    try {
      const imageUrls: Array<string> = (
        Object.values(banner?.banner) ?? []
      )?.reduce((acc: Array<string>, f: any) => {
        if (f && f.imageUrl) acc.push(f.imageUrl)
        return acc
      }, [])
      console.log(imageUrls)

      await removeFiles(imageUrls)
    } catch (e) {
      console.log(e)
    }
  }
  const toggleNameTranslation: any = () => {
    if (showDescriptionTranslation) setShowDescriptionTranslation(false)
    setShowNameTranslation(!showNameTranslation)
  }
  return (
    <div className='h-full'>
      <div className='grid h-full grid-cols-[400px_1fr] gap-4'>
        <div className='h-full rounded-md border p-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(v => handleSubmitForm(v))}
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
                              <Languages className='text-primary' size={20} />
                            </div>
                          }
                          title={'Layout Translation1'}
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

                    {(layoutType === 'carousel' ||
                      layoutType === 'carousel-mini') && (
                      <div className='flex flex-col gap-4'>
                        <FormRadioButton
                          formInstance={formInstance}
                          name={'properties.autoScroll'}
                          label={'Auto Scroll'}
                          isSmall={true}
                          options={[
                            { value: true, label: 'Yes' },
                            { value: false, label: 'No' }
                          ]}
                        />

                        {isAutoScroll && (
                          <FormInputField
                            isSmall={true}
                            formInstance={formInstance}
                            name={'properties.scrollTime'}
                            label={'Scroll Time (in Seconds)'}
                            type={'number'}
                            isReq={true}
                          />
                        )}
                      </div>
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
                    onClick={() => handleDelete()}
                  >
                    Delete
                  </Button>
                  <Button
                    type='button'
                    variant={'outline'}
                    className={'w-24'}
                    onClick={() => router.push('/sponsored-layout')}
                  >
                    Close
                  </Button>
                  <Button
                    type='submit'
                    loader={loading}
                    className={'w-24 text-center'}
                    ref={buttonRef}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
        <div
          className='h-full w-full overflow-y-auto rounded-md border bg-gray-50 p-4'
          style={{ height: 'calc(100vh - 100px)' }}
        >
          {sponsoredBanners?.length > 0 ? (
            <div className='space-y-3'>
              {sponsoredBanners?.map((banner, index) => {
                return (
                  <div
                    className='w-full space-y-3 rounded-md border p-4'
                    key={index}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='pb-2 text-sm font-semibold dark:text-white'>
                        {banner?.title}
                      </div>
                      <div className='flex items-center justify-end gap-4'>
                        <Button
                          size={'sm'}
                          variant={'destructive'}
                          onClick={() => handleDeleteBanner(banner)}
                        >
                          Delete
                        </Button>
                        <Button
                          size={'sm'}
                          variant={'default'}
                          onClick={() => handleBannerNavigation(banner?._id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div
                      className={`relative h-40 w-full overflow-hidden rounded-md`}
                    >
                      <Image
                        src={banner?.device?.desktop?.imageUrl}
                        alt={`Uploaded image ${index + 1}`}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw'
                        style={{ objectFit: 'contain' }}
                        className='rounded-md'
                      />
                    </div>
                  </div>
                )
              })}

              <div className='py-3'>
                <Button onClick={() => handleBannerNavigation()}>
                  Add New Banner
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex w-full items-center justify-between rounded-md bg-white p-4'>
              <p className='text-sm font-semibold'>Add Your Banner</p>

              <div>
                <Button onClick={() => handleBannerNavigation()}>
                  Add New Banner
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
