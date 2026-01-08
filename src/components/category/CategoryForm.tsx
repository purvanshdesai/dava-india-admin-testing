'use client'

import FormInputField from '@/components/form/FormInputField'
import FormMultiField from '@/components/form/FormMultiField'
import { SketchPicker } from 'react-color'
import FormRadioButton from '@/components/form/FormRadioButton'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { categoriesSchema } from '@/lib/zod'
import {
  useGetCategories,
  usePatchCategory,
  useSubmitAddCategory
} from '@/utils/hooks/categoryHook'
import { zodResolver } from '@hookform/resolvers/zod'
import { Languages } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { useGetSupportedLanguages } from '@/utils/hooks/appDataHooks'
import CategoryTranslationForm from '@/components/category/CategoryTranslationForm'
import { handleGetCategory } from '@/utils/actions/categoryActions'
import FormDialog from '@/components/form/FormDialogBox'
import { DialogClose } from '@/components/ui/dialog'
import FormComboboxField from '@/components/form/FormComboboxField'
import AppBreadcrumb from '@/components/Breadcrumb'
import FormSwitchField from '@/components/form/FormSwitchField'

import ImageUpload from '@/components/form/ImageUpload'
import { uploadFiles, removeFiles } from '@/utils/utils/fileUpload'

export type TCategoryForm = z.infer<typeof categoriesSchema>

export default function CategoryForm({
  params
}: {
  params: { categoryId: string }
}) {
  // router
  const router = useRouter()
  const isEdit: boolean = params.categoryId == 'new' ? false : true
  const [, setCategory] = useState<any>({})
  const [color, setColor] = useState('#fff')
  const [modifiedImageFile, setModifiedImageFiles] = useState<any>({
    newFile: null,
    removedFile: null
  })
  const [loading, setLoading] = useState(false)
  const [loader, setLoader] = useState(false)
  // translation state
  const [showNameTranslation, setShowNameTranslation] = useState(false)
  const [showDescriptionTranslation, setShowDescriptionTranslation] =
    useState(false)

  // toggle functions for translations
  const toggleNameTranslation: any = () => {
    if (showDescriptionTranslation) setShowDescriptionTranslation(false)
    setShowNameTranslation(!showNameTranslation)
  }

  const toggleDescriptionTranslation: any = () => {
    if (showNameTranslation) setShowNameTranslation(false)

    setShowDescriptionTranslation(!showDescriptionTranslation)
  }

  // fetch categories to display in form
  const categories: any = useGetCategories({ $limit: 0 })

  // fetch languages
  const { data: languages }: any = useGetSupportedLanguages({})

  // filtering categories based on type
  const mainCategories: unknown = categories.data?.data?.filter(
    (category: any) => category?.type === 'mainCategory'
  )
  const subCategories: unknown = categories.data?.data?.filter(
    (category: any) => category?.type === 'subCategory'
  )

  // form schema
  const form = useForm<z.infer<typeof categoriesSchema>>({
    resolver: zodResolver(categoriesSchema),
    values: {
      name: '',
      description: '',
      image: '',
      modifiedImage: null,
      displayOrder: '',
      seo: {
        url: '',
        description: '',
        title: '',
        keywords: []
      },
      slugUrl: '',
      isActive: true,
      type: 'mainCategory',
      subCategories: [],
      mainCategories: [],
      showOnAppNavigation: false,
      translations: {
        name: {
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
        },
        description: {
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
        setLoading(true)
        if (isEdit) {
          const category: any = await handleGetCategory(
            isEdit ? params.categoryId : ''
          )

          const convertedData = {
            ...category,
            subCategories:
              category.type == 'mainCategory' ? category?.subCategories : [],
            mainCategories:
              category.type == 'subCategory' ? category?.mainCategories : []
          }

          setCategory(convertedData)
          form.reset(convertedData)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.categoryId !== 'new'])

  // form radio button watcher
  const { watch } = form
  const selectedType = watch('type')

  // mutations functions to add/patch category data
  const addCategoryMutation = useSubmitAddCategory()
  const patchCategoryMutation = usePatchCategory()

  // submit function for form
  const handleSubmitForm = async () => {
    try {
      setLoader(true)
      const { image, ...rest } = formInstance.getValues()

      const imageUrl = await handleImageUpload(image)

      const updatedValues: any = {
        ...rest,
        displayOrder: Number(rest.displayOrder),
        image: imageUrl,
        translations: {
          ...rest.translations,
          name: {
            ...rest.translations.name,
            en: rest.name
          },
          description: {
            ...rest.translations.description,
            en: rest.description
          }
        },
        backGroundColor: color
      }

      if (isEdit) {
        console.log(updatedValues)
        await patchCategoryMutation.mutateAsync({
          categoryId: params.categoryId,
          data: {
            ...updatedValues
          }
        })
      } else {
        await addCategoryMutation.mutateAsync({
          ...updatedValues
        })
      }

      router.push('/categories')
    } catch (error) {
      console.log(error)
    } finally {
      setLoader(false)
    }
  }

  const handleImageUpload = async (oldImage: string) => {
    try {
      let imageUrl = oldImage
      const { newFile, removedFile } = modifiedImageFile

      if (removedFile) {
        await removeFiles([removedFile?.url])
        imageUrl = ''
      }

      if (newFile) {
        const [image] = await uploadFiles([newFile])
        imageUrl = image?.objectUrl
      }

      return imageUrl
    } catch (e) {
      console.log(e)
      return ''
    }
  }

  const handleChangeComplete = (selectedColor: any) => {
    setColor(selectedColor.hex)
    console.log('Selected Color:', selectedColor.hex)
  }

  const getImageField = () => {
    const { removedFile } = modifiedImageFile
    const imgUrl = formInstance?.formState?.defaultValues?.image

    return !imgUrl || removedFile?.url === imgUrl ? [] : [imgUrl]
  }

  return (
    <div className=''>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Categories', href: '/categories' },
            {
              page: isEdit
                ? (form?.formState?.defaultValues?.name ?? '')
                : 'Add New Category'
            }
          ]}
        />
      </div>

      <div className='pt-4'>
        {!loading && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitForm)}>
              {/* {JSON.stringify(form.watch())} */}
              <div
                className='flex flex-col gap-3 overflow-y-auto pb-10'
                style={{ height: 'calc(100vh - 146px)' }}
              >
                <div>
                  <div className='grid gap-8'>
                    <div className='ml-1 grid grid-cols-2 gap-8'>
                      <div className='flex items-center gap-4'>
                        <FormInputField
                          formInstance={formInstance}
                          name={'name'}
                          label={'Category Name'}
                          placeholder={'Enter Category Name'}
                          isSmall={true}
                          isReq={true}
                          className='w-[410px]'
                        />

                        {
                          <FormDialog
                            content={
                              <CategoryTranslationForm
                                type='name'
                                formInstance={formInstance}
                                translationValues={languages}
                                translateType='productTranslate'
                                translationFor='product category name'
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
                            title={'Name Translation'}
                            footerActions={() => (
                              <div className='flex items-center gap-3'>
                                <DialogClose>
                                  <Button
                                    variant='secondary'
                                    onClick={() => formInstance.reset()}
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
                      <div className='flex items-center gap-4'>
                        {' '}
                        <FormInputField
                          formInstance={formInstance}
                          name={'description'}
                          label={'Category Description'}
                          placeholder={'Enter Category Description'}
                          isSmall={true}
                          isReq={true}
                          className='w-[410px]'
                        />
                        {
                          <FormDialog
                            content={
                              <CategoryTranslationForm
                                type='description'
                                formInstance={formInstance}
                                translationValues={languages}
                                formType='textarea'
                                translationFor='product category description'
                              />
                            }
                            trigger={
                              <div
                                className='mt-8 cursor-pointer rounded-lg border-2 border-primary p-2'
                                onClick={toggleDescriptionTranslation}
                              >
                                <Languages className='text-primary' size={20} />
                              </div>
                            }
                            title={'Description Translation'}
                            footerActions={() => (
                              <div className='flex items-center gap-3'>
                                <DialogClose>
                                  <Button
                                    variant='secondary'
                                    onClick={() => formInstance.reset()}
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

                      <FormRadioButton
                        disabled={isEdit ? true : false}
                        formInstance={formInstance}
                        name={'type'}
                        label={'Type'}
                        isSmall={true}
                        options={[
                          { value: 'mainCategory', label: 'Main Category' },
                          { value: 'subCategory', label: 'Sub Category' }
                        ]}
                      />
                    </div>

                    {selectedType === 'mainCategory' && (
                      <div className='ml-1 flex w-1/2 flex-col gap-8'>
                        <FormComboboxField
                          formInstance={formInstance}
                          isSmall={true}
                          multiple={true}
                          label={'Sub Category'}
                          name='subCategories'
                          items={(subCategories as any)?.map((c: any) => ({
                            label: c.name,
                            value: c._id
                          }))}
                          className='w-full'
                        />
                      </div>
                    )}

                    <div className='ml-1 w-1/2'>
                      <p className='pb-2 text-sm'>Image</p>
                      <ImageUpload
                        existingFiles={getImageField()}
                        onUploadNewFiles={(
                          file: Array<File>,
                          removedFile: any
                        ) => {
                          setModifiedImageFiles({
                            newFile: Array.isArray(file) ? file[0] : file,
                            removedFile:
                              removedFile ?? modifiedImageFile.removedFile
                          })
                        }}
                        onRemoveFile={(res: File) => {
                          setModifiedImageFiles({
                            ...modifiedImageFile,
                            removedFile: res
                          })
                        }}
                      />
                    </div>

                    <div className='ml-1'>
                      <h1 className='py-3 text-sm'>Pick a Color</h1>
                      <SketchPicker
                        color={color}
                        onChangeComplete={handleChangeComplete}
                      />
                      <p className='mt-5 text-sm'>Selected Color: {color}</p>
                    </div>

                    {selectedType === 'subCategory' && (
                      <div className='border-b pb-4'>
                        <div className='ml-1 flex w-1/2 flex-col gap-8'>
                          <FormComboboxField
                            multiple={true}
                            formInstance={formInstance}
                            isSmall={true}
                            label={'Main Category'}
                            name='mainCategories'
                            items={(mainCategories as any)?.map((c: any) => ({
                              label: c.name,
                              value: c._id
                            }))}
                            className='w-full'
                          />

                          {/* <div className='flex h-[100px] w-[200px] flex-col gap-3'>
                          <FormLabel className='block text-sm text-black dark:text-gray-300'>
                            Category Image
                          </FormLabel>{' '}
                          <img
                            src='https://fastly.picsum.photos/id/295/200/300.jpg?hmac=b6Ets6Bu47pFHcU4UK7lI6xYkfy48orifVzWeHAe0zM'
                            alt='cds'
                            className='h-[100px] w-[200px]'
                          />
                        </div> */}
                        </div>
                        <div className='ml-1 mt-10 grid grid-cols-2 gap-8 border-t'>
                          <div className='col-span-2 mt-4 text-lg font-semibold'>
                            Search Engine Optimization (SEO)
                          </div>
                          <FormInputField
                            formInstance={formInstance}
                            name={'seo.url'}
                            label={'SEO/URL'}
                            placeholder={'Enter the URL'}
                            isSmall={true}
                          />
                          <FormInputField
                            formInstance={formInstance}
                            name={'seo.title'}
                            label={'Meta Title'}
                            placeholder={'Enter the meta title'}
                            isSmall={true}
                          />
                          <FormInputField
                            formInstance={formInstance}
                            name={'seo.description'}
                            label={'Meta Description'}
                            placeholder={'Enter the meta description'}
                            isSmall={true}
                          />
                          <FormMultiField
                            formInstance={formInstance}
                            name={'seo.keywords'}
                            label={'SEO Keywords'}
                            placeholder={'Enter keywords'}
                            type='keyword'
                          />
                        </div>
                      </div>
                    )}

                    <div className='ml-3 grid w-1/2 gap-8'>
                      <div>
                        <FormInputField
                          formInstance={formInstance}
                          name={'slugUrl'}
                          label={'Slug Url'}
                          placeholder={'Enter the Slug URL'}
                          isSmall={true}
                          isReq={true}
                        />
                      </div>
                      <FormInputField
                        type='number'
                        formInstance={formInstance}
                        name={'displayOrder'}
                        label={'Display Order'}
                        placeholder={'Enter number to order category'}
                        isSmall={true}
                        isReq={true}
                      />

                      <FormSwitchField
                        isSmall={true}
                        name={'showOnAppNavigation'}
                        formInstance={formInstance}
                        label={'Show on app navigation'}
                      />
                      <FormSwitchField
                        isSmall={true}
                        name={'isActive'}
                        formInstance={formInstance}
                        label={'Active Status'}
                      />
                    </div>
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
                    loader={loader}
                    className={'w-24 text-center'}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
