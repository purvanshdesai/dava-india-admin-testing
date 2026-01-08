import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import { sponsoredLayoutCommonSchema } from '@/lib/zod'
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
import Image from 'next/image'
import FormDialog from '@/components/form/FormDialogBox'
import CategoryTranslationForm from '@/components/category/CategoryTranslationForm'
import { Languages } from 'lucide-react'
import { DialogClose } from '@radix-ui/react-dialog'
import { useGetSupportedLanguages } from '@/utils/hooks/appDataHooks'

export default function CommonLayout() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const sponsorId = params?.sponsorId as string
  const layoutType = searchParams.get('type')

  const [loading, setLoading] = useState(false)
  const { data: languages }: any = useGetSupportedLanguages({})
  const [showDescriptionTranslation, setShowDescriptionTranslation] =
    useState(false)
  const [showNameTranslation, setShowNameTranslation] = useState(false)

  // form schema
  const form = useForm<z.infer<typeof sponsoredLayoutCommonSchema>>({
    resolver: zodResolver(sponsoredLayoutCommonSchema),
    values: {
      title:
        layoutType == 'davaone-membership'
          ? 'DavaOne Membership'
          : 'Generic Medicine Info',
      properties: {},
      type: layoutType ?? '',
      startDate: null,
      endDate: null,
      isActive: true,
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

  // form reset when edit
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (sponsorId === 'new') return

        const settings = await fetchSponsorDetailById(sponsorId)

        const convertedData = {
          ...settings,
          startDate: settings?.startDate ? new Date(settings?.startDate) : null,
          endDate: settings?.endDate ? new Date(settings?.endDate) : null
        }

        form.reset(convertedData)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [sponsorId !== 'new'])

  // submit function for form
  const handleSubmitForm = async (
    values: z.infer<typeof sponsoredLayoutCommonSchema> | any
  ) => {
    try {
      setLoading(true)
      const payload = { ...values }
      console.log(payload)

      if (sponsorId !== 'new') {
        await updateSponsorLayout({ _id: sponsorId, ...payload })
        toast({
          title: 'Success',
          description: 'Updated successfully'
        })
      } else {
        await createSponsoredLayout(payload)
        toast({
          title: 'Success',
          description: 'Created successfully'
        })
      }
      router.push('/sponsored-layout')
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
              onSubmit={form.handleSubmit(handleSubmitForm)}
              className='flex h-full flex-col justify-between'
            >
              <div className='flex flex-col gap-3'>
                <div>
                  <div className='grid gap-8'>
                    <div className='flex flex-row items-center justify-between gap-4'>
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
                                <Languages className='text-primary' size={20} />
                              </div>
                            }
                            title={'Layout  Translation'}
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

                    <div
                      className={`w-full ${layoutType == 'generic-medicine-info' ? 'block' : 'hidden'}`}
                    >
                      <FormInputField
                        formInstance={formInstance}
                        name={'properties.videoUrl'}
                        label={'Video Url'}
                        placeholder={'Enter Video Url'}
                        isSmall={true}
                        isReq={true}
                      />
                    </div>

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
                    onClick={() => router.back()}
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
        <div className='h-full w-full rounded-md border p-4'>
          <div>
            {layoutType === 'davaone-membership' && (
              <div>
                <div
                  className={`relative h-48 w-full overflow-hidden rounded-md`}
                >
                  <Image
                    src={'/images/DavaoneMembershipBanner.svg'}
                    alt={`Banner Image`}
                    fill
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    style={{ objectFit: 'contain' }}
                    className='rounded-md'
                  />
                </div>
              </div>
            )}
            {layoutType === 'generic-medicine-info' && (
              <div className='grid grid-cols-[1fr_2fr_auto] gap-6'>
                <div>
                  <div>
                    <iframe
                      className='h-[250px] w-full'
                      src={form?.getValues('properties.videoUrl')}
                      title='YouTube video player'
                      frameBorder='0'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
                <div className='space-y-3'>
                  <p className='text-lg font-bold'>
                    Generic medicines are the smarter choice
                  </p>
                  <div className='grid grid-cols-3'>
                    <div className='space-y-2'>
                      <p className='text-sm font-semibold'>Safe</p>
                      <div className='text-xs text-label'>
                        Lorem ipsum dolor sit amet consectetur, adipisicing
                        elit. Sequi, rerum?
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm font-semibold'>Same</p>
                      <div className='text-xs text-label'>
                        Lorem ipsum dolor sit amet consectetur, adipisicing
                        elit. Sequi, rerum?
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm font-semibold'>Savings</p>
                      <div className='text-xs text-label'>
                        Lorem ipsum dolor sit amet consectetur, adipisicing
                        elit. Sequi, rerum?
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Button size={'sm'}>Know More</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
