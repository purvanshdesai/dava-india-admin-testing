import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import { sponsoredLayoutFeaturedSchema } from '@/lib/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInputField from '@/components/form/FormInputField'
import FormDatePicker from '@/components/form/FormDatePicker'
import FormSwitchField from '@/components/form/FormSwitchField'
import { toast } from '@/hooks/use-toast'
import AddProductsModal from '../AddProductsModal'
import AddCategoriesModal from '../AddCategoriesModal'
import Image from 'next/image'
import { Languages, Trash2 } from 'lucide-react'
import {
  createSponsoredLayout,
  updateSponsorLayout,
  fetchSponsorDetailById,
  deleteSponsorLayout
} from '@/utils/actions/sponsoredActions'
import FormDialog from '@/components/form/FormDialogBox'
import CategoryTranslationForm from '@/components/category/CategoryTranslationForm'
import { DialogClose } from '@radix-ui/react-dialog'
import { useGetSupportedLanguages } from '@/utils/hooks/appDataHooks'
import FormComboboxField from '@/components/form/FormComboboxField'
import { useGetAllCollections } from '@/utils/hooks/collectionsHooks'
import { fetchCollectionProducts } from '@/utils/actions/productActions'

export default function FeaturedLayout() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const sponsorId = params?.sponsorId as string
  const layoutType = searchParams.get('type')

  type Theme = 'none' | 'theme-mariegold' | 'theme-rose' | 'theme-lavender'
  const [selectedTheme, setSelectedTheme] = useState<Theme>('none')
  const themeOptions = [
    { value: 'none', label: 'None' },
    { value: 'theme-mariegold', label: 'Theme-mariegold' },
    { value: 'theme-rose', label: 'Theme-rose' },
    { value: 'theme-lavender', label: 'Theme-lavender' }
  ]

  const themeBackground = {
    'theme-mariegold': '/images/Mariegold.svg',
    'theme-rose': '/images/Rose.svg',
    'theme-lavender': '/images/Lavender.svg',
    none: ''
  }

  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([]) as any
  const [collections, setCollections] = useState([]) as any
  const { data: languages }: any = useGetSupportedLanguages({})
  const [showDescriptionTranslation, setShowDescriptionTranslation] =
    useState(false)
  const [showNameTranslation, setShowNameTranslation] = useState(false)

  const { data: collectionsData } = useGetAllCollections()

  // form schema
  const form = useForm<z.infer<typeof sponsoredLayoutFeaturedSchema>>({
    resolver: zodResolver(sponsoredLayoutFeaturedSchema),
    values: {
      title: '',
      type: layoutType ?? '',
      products: [],
      collections: [],
      collection: null,
      properties: { theme: '' },
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
          endDate: settings?.endDate ? new Date(settings?.endDate) : null,
          collections: (settings?.collections ?? [])?.map((c: any) => c._id),
          products: (settings?.products ?? [])?.map((c: any) => c._id),
          collection: settings?.collection
        }
        setProducts(settings?.products)
        setCollections(settings?.collections)

        form.reset(convertedData)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [sponsorId !== 'new'])

  useEffect(() => {
    const fetchAllCollectionProducts = async () => {
      try {
        const collectionId: any = form.getValues('collection')

        const collectionIds = []

        if (collectionId?.length > 0) {
          collectionIds.push(collectionId)
          const res = await fetchCollectionProducts(collectionIds)
          const data = res?.data.map((d: any) => d._id)
          form.setValue('products', Array.from(new Set(data)))
          setProducts(res?.data ?? res)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchAllCollectionProducts()
  }, [collectionsData, form.watch('collection')])

  useEffect(() => {
    const themeName = form.getValues('properties.theme') as Theme
    if (
      ['none', 'theme-mariegold', 'theme-rose', 'theme-lavender'].includes(
        themeName
      )
    ) {
      setSelectedTheme(themeName)
    }
  }, [form.watch('properties.theme')])

  // submit function for form
  const handleSubmitForm = async (
    values: z.infer<typeof sponsoredLayoutFeaturedSchema> | any
  ) => {
    try {
      setLoading(true)

      const payload = { ...values }

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

  const handleAddProduct = (value: any) => {
    const filterData: any = value.map((t: any) => t._id)

    const { products: existingData }: any = form?.formState.defaultValues

    const combinedData: any = [...(existingData ?? []), ...filterData]

    form.setValue('products', Array.from(new Set(combinedData)))
    setProducts([...products, ...value])
  }

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = products.filter((_: any, i: any) => i !== index)

    const { products: existingData }: any = form?.formState.defaultValues

    const filteredData = existingData.filter((_: any, i: any) => i !== index)

    form.setValue('products', Array.from(new Set(filteredData)))

    setProducts(updatedProducts)
  }

  // Category
  const handleAddCategory = (value: any) => {
    const filterData: any = value.map((t: any) => t._id)

    const { collections: existingData }: any = form?.formState.defaultValues

    const combinedData: any = [...existingData, ...filterData]
    form.setValue('collections', Array.from(new Set(combinedData)))
    setCollections([...collections, ...value])
  }

  const handleDeleteCategory = (index: number) => {
    const updatedCollections = collections.filter(
      (_: any, i: any) => i !== index
    )

    const { collections: existingData }: any = form?.formState.defaultValues

    const filteredData = existingData.filter((_: any, i: any) => i !== index)

    form.setValue('collections', Array.from(new Set(filteredData)))

    setCollections(updatedCollections)
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
            {/* {JSON.stringify(form.watch())} */}
            <form
              onSubmit={form.handleSubmit(handleSubmitForm)}
              className='flex h-full flex-col justify-between'
            >
              <div className='flex flex-col gap-3'>
                <div>
                  <div className='grid gap-8'>
                    <div className='flex flex-row items-center gap-3'>
                      <div className='flex-1'>
                        <FormInputField
                          formInstance={formInstance}
                          name={'title'}
                          label={'Layout Title'}
                          placeholder={'Enter Layout Title'}
                          isSmall={true}
                          isReq={true}
                          className='w-full flex-1'
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

                    {layoutType === 'featured-products' && (
                      <FormComboboxField
                        isSmall={true}
                        formInstance={form as unknown as UseFormReturn}
                        multiple={false}
                        label={'Collection'}
                        name={'collection'}
                        items={(collectionsData as any)?.map((c: any) => ({
                          label: c.name,
                          value: c._id
                        }))}
                        className={'w-full'}
                      />
                    )}
                    {layoutType === 'featured-products' && (
                      <div
                        className='rounded-md p-5'
                        style={{
                          backgroundImage:
                            selectedTheme && selectedTheme !== 'none'
                              ? `url(${themeBackground[selectedTheme]})`
                              : 'none',
                          backgroundColor:
                            selectedTheme === 'none'
                              ? '#FFFFFF'
                              : 'transparent',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          backgroundSize: 'cover',
                          zIndex: 0
                        }}
                      >
                        <FormComboboxField
                          formInstance={formInstance}
                          name='properties.theme'
                          label='Theme'
                          items={(themeOptions as any)?.map((c: any) => ({
                            label: c.label,
                            value: c.value
                          }))}
                          isSmall={true}
                          multiple={false}
                          className='bg w-full'
                        />
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
            {layoutType === 'featured-categories' && (
              <div className=''>
                <p className='font-semibold text-black'>
                  Collections
                  {form.formState.errors &&
                    form.formState.errors?.collections && (
                      <span className='px-3 text-xs text-red-600'>
                        Error: Minimum 1 category should be selected!
                      </span>
                    )}
                </p>
                <div
                  className='w-full space-y-3 overflow-y-auto'
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                >
                  <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {collections?.map((category: any, index: any) => (
                      <div key={index} className='w-full'>
                        <div className='flex w-full flex-col items-center justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-start sm:gap-0'>
                          {/* Left Section - Image and Text */}
                          <div className='flex flex-row items-center'>
                            <div className='flex-shrink-0 overflow-hidden rounded-none border bg-gray-300'>
                              <Image
                                src={category?.image}
                                alt={category?.name || 'Category Image'}
                                className='h-16 w-16 object-cover'
                                height={61}
                                width={61}
                              />
                            </div>
                            <div className='ml-3 flex flex-col items-start gap-2'>
                              <p className='max-w-[120px] truncate text-sm font-medium text-gray-800 sm:max-w-[200px]'>
                                {category.name}
                              </p>
                              <p className='line-clamp-2 w-full text-xs text-gray-600'>
                                {category.description}
                              </p>
                            </div>
                          </div>

                          {/* Right Section - Action Button */}
                          <div className='mt-2 flex justify-end sm:mt-0'>
                            <div
                              className='cursor-pointer text-xs text-red-500 hover:text-red-600'
                              onClick={() => handleDeleteCategory(index)}
                            >
                              <Trash2 size={18} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='mt-5'>
                  <AddCategoriesModal
                    AddCategory={(value: any) => handleAddCategory(value)}
                    alreadyExistCategoryIds={form.getValues('collections')}
                  />
                </div>
              </div>
            )}

            {layoutType === 'featured-products' && (
              <div className='w-full'>
                <p className='font-semibold text-black'>
                  Products
                  {form.formState.errors && form.formState.errors?.products && (
                    <span className='px-3 text-xs text-red-600'>
                      Error: Minimum 1 products should be selected!
                    </span>
                  )}
                </p>
                <div
                  className='w-full space-y-3 overflow-y-auto pt-4'
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                >
                  {products?.map((product: any, index: any) => (
                    <div key={index}>
                      <div className='flex w-full flex-row items-center justify-between rounded-lg border p-3'>
                        <div className='flex flex-row items-center justify-center'>
                          <div className='rounded-none border bg-[#888888]'>
                            <Image
                              src={product?.thumbnail}
                              alt={''}
                              className='h-[61px] w-[61px]'
                              height={61}
                              width={61}
                            />
                          </div>
                          <div className='ml-3 flex flex-col items-start gap-3'>
                            <p className='text-sm font-medium'>
                              {product.title}
                            </p>
                            <p className='line-clamp-2 w-96 text-xs font-medium text-label'>
                              {product.description}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className='flex flex-row items-center justify-between'>
                            <div
                              className='mr-2 cursor-pointer text-xs text-red-500'
                              onClick={() => handleDeleteProduct(index)}
                            >
                              <Trash2 size={18} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-5 hidden'>
                  <AddProductsModal
                    AddProduct={(value: any) => handleAddProduct(value)}
                    alreadyExistProductIds={form.getValues('products')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
