'use client'
import FormInputField from '@/components/form/FormInputField'

import FormRadioButton from '@/components/form/FormRadioButton'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { sectionSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import FormSwitchField from '@/components/form/FormSwitchField'
import FormDatePicker from '@/components/form/FormDatePicker'
// import { useFetchProducts } from '@/utils/hooks/productHooks'
import AddProductsModal from '@/components/sponsored/AddProductsModal'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import {
  createSponsored,
  fetchSponsorDetailById,
  updateSponsorDetails
} from '@/utils/actions/sponsoredSettingActions'
import AppBreadcrumb from '@/components/Breadcrumb'
import ImageUpload from '@/components/form/ImageUpload'
import { uploadFiles, removeFiles } from '@/utils/utils/fileUpload'
import { toast } from '@/hooks/use-toast'
import AddCategoriesModal from '@/components/sponsored/AddCategoriesModal'

export type TSectionForm = z.infer<typeof sectionSchema>

export default function SponsorSectionForm({
  params
}: {
  params: { _id: string }
}) {
  const router = useRouter()
  const isEdit = params?._id !== 'new'
  const [sponsoredSetting, setFetchedSponsoredSettings] = useState<any>({})
  const [modifiedImageFiles, setModifiedImageFiles] = useState<any>({
    newFiles: [],
    removedFiles: []
  })
  const [products, setProducts] = useState([]) as any
  const [categories, setCategories] = useState([]) as any
  const [loading, setLoading] = useState(false)
  // fetch categories to display in form

  // form schema
  const form = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    values: {
      sectionName: '',
      sectionType: 'carousel',
      images: [],
      isActive: true,
      type: 'promotion',
      columnOnLayout: 1,
      startDate: null,
      endDate: null,
      products: [],
      categories: [],
      position: '0'
    }
  })
  const formInstance = form as unknown as UseFormReturn

  // form reset when edit
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (params?._id === 'new') return

        const settings = await fetchSponsorDetailById(params?._id)
        setFetchedSponsoredSettings(settings)
        const convertedData = {
          ...settings,
          startDate: settings?.startDate ? new Date(settings?.startDate) : null,
          endDate: settings?.endDate ? new Date(settings?.endDate) : null,
          position: `${settings?.position}`,
          categories: (settings?.categories ?? [])?.map((c: any) => c._id),
          products: (settings?.products ?? [])?.map((c: any) => c._id)
        }
        setProducts(settings?.products)
        setCategories(settings?.categories)
        form.reset(convertedData)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [params._id !== 'new'])

  // form radio button watcher
  const { watch } = form
  const selectedType = watch('type')

  const selectedSectionType = watch('sectionType')

  const handleAddProduct = (value: any) => {
    const filterData: any = value.map((t: any) => t._id)

    const { products: existingData }: any = form?.formState.defaultValues

    const combinedData: any = [...(existingData ?? []), ...filterData]

    form.setValue('products', Array.from(new Set(combinedData)))
    setProducts([...products, ...value])
  }

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = products.filter((_: any, i: any) => i !== index)

    const existingData =
      form?.getValues('products')?.map((i: any) => i._id) ?? []

    const filteredData = existingData.filter((_: any, i: any) => i !== index)

    form.setValue('products', Array.from(new Set(filteredData)))

    setProducts(updatedProducts)
  }

  // Category
  const handleAddCategory = (value: any) => {
    const filterData: any = value.map((t: any) => t._id)

    const { categories: existingData }: any = form?.formState.defaultValues

    const combinedData: any = [...existingData, ...filterData]
    form.setValue('categories', Array.from(new Set(combinedData)))
    setCategories([...categories, ...value])
  }

  const handleDeleteCategory = (index: number) => {
    const updatedCategories = categories.filter((_: any, i: any) => i !== index)

    const { categories: existingData }: any = form?.formState.defaultValues

    const filteredData = existingData.filter((_: any, i: any) => i !== index)

    form.setValue('categories', Array.from(new Set(filteredData)))

    setCategories(updatedCategories)
  }

  // submit function for form
  const handleSubmitForm = async (
    values: z.infer<typeof sectionSchema> | any
  ) => {
    try {
      setLoading(true)
      const { images, ...rest } = values
      let imageFiles = rest?.images ?? []

      imageFiles = await handleImageUpload(images)

      const payload = {
        ...rest,
        position: Number(rest.position),
        columnOnLayout: Number(rest.columnOnLayout),
        images: imageFiles
      }
      // console.log('payload', payload)
      if (params._id !== 'new') {
        await updateSponsorDetails({ _id: params._id, ...payload })
        toast({
          title: 'Success',
          description: 'Updated successfully'
        })
      } else {
        await createSponsored(payload)
        toast({
          title: 'Success',
          description: 'Created successfully'
        })
      }
      router.push('/sponsored')
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (oldImages: Array<any>) => {
    try {
      const { newFiles, removedFiles } = modifiedImageFiles
      let images = oldImages

      for (const file of newFiles) {
        if (file) {
          const [image] = await uploadFiles([file])
          images.push({ imageUrl: image?.objectUrl })
        }
      }

      if (removedFiles?.length) {
        const removed = removedFiles?.map(({ url }: { url: string }) => url)
        images = images.filter(f => !removed.includes(f.imageUrl))

        await removeFiles(removed)
      }

      return images
    } catch (e) {
      console.log(e)
      return ''
    }
  }

  const getImageField = () => {
    const { removedFiles } = modifiedImageFiles
    const oldImages =
      sponsoredSetting?.images?.map((i: any) => i.imageUrl) ?? []

    const res = oldImages.filter((i: string) => {
      return !removedFiles.find((f: any) => f.url === i)
    })

    return res
  }

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Sponsored', href: '/sponsored' },
            {
              page: 'Add New Sponsored Section'
            }
          ]}
        />
      </div>

      <div className='pt-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)}>
            <div
              className='flex flex-col gap-3 overflow-y-auto pb-10 pl-2'
              style={{ height: 'calc(100vh - 146px)' }}
            >
              <div>
                <div className='grid gap-8'>
                  <div className='grid grid-cols-2 gap-8'>
                    <FormRadioButton
                      formInstance={formInstance}
                      name={'type'}
                      label={'Type'}
                      isSmall={true}
                      options={[
                        { value: 'featured', label: 'Featured' },
                        { value: 'promotion', label: 'Promotion' }
                      ]}
                      disabled={isEdit ? true : false}
                    />
                  </div>
                  <div className='flex items-center gap-4'>
                    <FormInputField
                      formInstance={formInstance}
                      name={'sectionName'}
                      label={'Section Name'}
                      placeholder={'Enter Section Name'}
                      isSmall={true}
                      isReq={true}
                      className='w-[530px]'
                    />
                  </div>

                  {/* featured */}
                  {selectedType === 'featured' && (
                    <div className='flex flex-col gap-8'>
                      <div className='w-1/2'>
                        {' '}
                        <FormRadioButton
                          formInstance={formInstance}
                          name={'sectionType'}
                          label={'Section Type'}
                          isSmall={true}
                          options={[
                            { value: 'categories', label: 'Categories' },
                            { value: 'products', label: 'Products' }
                          ]}
                          disabled={isEdit ? true : false}
                        />
                      </div>

                      {selectedSectionType === 'categories' && (
                        <div className=''>
                          <p className='font-semibold text-black'>
                            Sub Categories
                          </p>
                          {categories?.map((category: any, index: any) => (
                            <div className='mt-5 grid grid-cols-2' key={index}>
                              <div className='flex w-full flex-row items-center justify-between rounded-lg border pb-2 pl-3 pr-3 pt-2'>
                                <div className='flex flex-row items-center justify-center'>
                                  <div className='rounded-none border bg-[#888888]'>
                                    <Image
                                      src={category?.image}
                                      alt={''}
                                      className='h-[61px] w-[61px]'
                                      height={61}
                                      width={61}
                                    />
                                  </div>
                                  <div className='ml-3 flex flex-col items-start gap-3'>
                                    <p className='text-sm font-medium text-[#888888]'>
                                      {category.name}
                                    </p>
                                    <p className='line-clamp-2 w-36 text-xs font-medium text-[#888888]'>
                                      {category.description}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <div className='flex flex-row items-center justify-between'>
                                    <div
                                      className='mr-2 cursor-pointer text-xs text-red-500'
                                      onClick={() =>
                                        handleDeleteCategory(index)
                                      }
                                    >
                                      <Trash2 size={18} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className='mt-5'>
                            <AddCategoriesModal
                              AddCategory={(value: any) =>
                                handleAddCategory(value)
                              }
                              alreadyExistCategoryIds={form.getValues(
                                'categories'
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {selectedSectionType === 'products' && (
                        <div className=''>
                          <p className='font-semibold text-black'>Products</p>
                          {products?.map((product: any, index: any) => (
                            <div className='mt-5 grid grid-cols-4' key={index}>
                              <div className='flex w-full flex-row items-center justify-between rounded-lg border pb-2 pl-3 pr-3 pt-2'>
                                <div className='flex flex-row items-center justify-center'>
                                  <div className='rounded-none border bg-[#888888]'>
                                    <Image
                                      src={product?.images[0]?.objectUrl}
                                      alt={''}
                                      className='h-[61px] w-[61px]'
                                      height={61}
                                      width={61}
                                    />
                                  </div>
                                  <div className='ml-3 flex flex-col items-start gap-3'>
                                    <p className='text-sm font-medium text-[#888888]'>
                                      {product.title}
                                    </p>
                                    <p className='line-clamp-2 w-36 text-xs font-medium text-[#888888]'>
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
                          <div className='mt-5'>
                            <AddProductsModal
                              AddProduct={(value: any) =>
                                handleAddProduct(value)
                              }
                              alreadyExistProductIds={form.getValues(
                                'products'
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* promotions */}
                  {selectedType === 'promotion' && (
                    <div>
                      <div className='flex flex-col gap-8'>
                        <FormRadioButton
                          formInstance={formInstance}
                          name={'sectionType'}
                          label={'Section Type'}
                          isSmall={true}
                          options={[
                            { value: 'full-banner', label: 'Full Banner' },
                            { value: 'carousel', label: 'Carousel' }
                          ]}
                          disabled={isEdit ? true : false}
                        />
                        {/* <div className='flex w-full flex-col gap-3'>
                          <div>
                            <FormUploadField
                              isSmall={true}
                              formInstance={form as unknown as UseFormReturn}
                              name={'images'}
                              label={'Add Banners'}
                              isReq={true}
                              multiple={true}
                              isBanner={true}
                            />
                          </div>
                        </div> */}

                        <div className='pr-6'>
                          <p className='pb-2 text-sm'>
                            {selectedSectionType === 'carousel'
                              ? 'Select Multiple files'
                              : 'Select a file'}{' '}
                            <span>*</span>
                          </p>
                          <ImageUpload
                            multiple={selectedSectionType === 'carousel'}
                            existingFiles={getImageField()}
                            imageContainerStyle={'flex flex-col'}
                            imageStyle={'h-60 w-full'}
                            onUploadNewFiles={(res: Array<File>) => {
                              const { newFiles, removedFiles } =
                                modifiedImageFiles

                              setModifiedImageFiles({
                                removedFiles,
                                newFiles: [...newFiles, ...res]
                              })
                            }}
                            onRemoveFile={(res: File) => {
                              const { newFiles, removedFiles } =
                                modifiedImageFiles

                              setModifiedImageFiles({
                                newFiles,
                                removedFiles: [...removedFiles, res]
                              })
                            }}
                          />
                        </div>

                        {selectedSectionType === 'carousel' && (
                          <FormInputField
                            type='number'
                            formInstance={formInstance}
                            name={'columnOnLayout'}
                            label={'Columns'}
                            placeholder={'Enter columns'}
                            isSmall={true}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-8'>
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
                    <div className='flex items-center gap-4'>
                      <FormInputField
                        type='number'
                        formInstance={formInstance}
                        name={'position'}
                        label={'Position'}
                        placeholder={'Enter Position'}
                        isSmall={true}
                        isReq={true}
                        className='w-[530px]'
                      />
                    </div>
                  </div>
                  <FormSwitchField
                    isSmall={true}
                    name={'isActive'}
                    formInstance={form as unknown as UseFormReturn}
                    label={'Active'}
                  />
                </div>
              </div>
            </div>

            <div className='sticky bottom-0 left-0 w-full bg-white pr-3 pt-2 dark:bg-slate-800'>
              <div className='flex justify-end gap-[20px]'>
                <Button
                  type='button'
                  variant={'outline'}
                  className={'w-24'}
                  onClick={() => router.back()}
                >
                  Cancel
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
    </div>
  )
}
