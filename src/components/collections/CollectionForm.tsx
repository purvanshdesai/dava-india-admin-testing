'use client'

import FormInputField from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { collectionSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Languages } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { useGetSupportedLanguages } from '@/utils/hooks/appDataHooks'
import CategoryTranslationForm from '@/components/category/CategoryTranslationForm'
import FormDialog from '@/components/form/FormDialogBox'
import { DialogClose } from '@/components/ui/dialog'
import AppBreadcrumb from '@/components/Breadcrumb'
import FormSwitchField from '@/components/form/FormSwitchField'
import {
  createCollection,
  handleGetCollection,
  updateCollection
} from '@/utils/actions/collectionActions'

import ImageUpload from '@/components/form/ImageUpload'
import { uploadFiles, removeFiles } from '@/utils/utils/fileUpload'

export type TCategoryForm = z.infer<typeof collectionSchema>

export default function CollectionForm({
  params
}: {
  params: { collectionId: string }
}) {
  // router
  const router = useRouter()

  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const isEdit: boolean = params.collectionId == 'new' ? false : true
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

  // fetch languages
  const { data: languages }: any = useGetSupportedLanguages({})

  // form schema
  const form = useForm<z.infer<typeof collectionSchema>>({
    resolver: zodResolver(collectionSchema),
    values: {
      name: '',
      description: '',
      image: '',
      slugUrl: '',
      isActive: true,
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
          const category: any = await handleGetCollection(
            isEdit ? params.collectionId : ''
          )

          form.reset(category)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.collectionId !== 'new'])

  // submit function for form
  const handleSubmitForm = async () => {
    try {
      setLoader(true)
      const { image, ...rest } = formInstance.getValues()

      const imageUrl = await handleImageUpload(image)

      const updatedValues: any = {
        ...rest,
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
        }
      }
      console.log(updatedValues)

      if (isEdit) {
        await updateCollection({ ...updatedValues })
      } else {
        await createCollection({ ...updatedValues })
      }

      router.push(`/collections?page=${page}&limit=${limit}`)
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
            { page: 'Collections', href: '/collections' },
            {
              page: isEdit
                ? (form?.formState?.defaultValues?.name ?? '')
                : 'Add New Collection'
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
                    <div className='ml-1 flex flex-col gap-6'>
                      <div className='flex w-1/3 items-center gap-4'>
                        <FormInputField
                          formInstance={formInstance}
                          name={'name'}
                          label={'Collection Name'}
                          placeholder={'Enter Collection Name'}
                          isSmall={true}
                          isReq={true}
                          className='w-[500px]'
                        />

                        {
                          <FormDialog
                            content={
                              <CategoryTranslationForm
                                type='name'
                                formInstance={formInstance}
                                translationValues={languages}
                                translateType='productTranslate'
                                translationFor='product collection name'
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
                      <div className='flex w-1/3 items-center gap-4'>
                        <FormInputField
                          formInstance={formInstance}
                          name={'description'}
                          label={'Collection Description'}
                          placeholder={'Enter Collection Description'}
                          isSmall={true}
                          isReq={true}
                          className='w-[500px]'
                        />
                        {
                          <FormDialog
                            content={
                              <CategoryTranslationForm
                                type='description'
                                formInstance={formInstance}
                                translationValues={languages}
                                formType='textarea'
                                translationFor='product collection description'
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

                      <div>
                        <FormInputField
                          formInstance={formInstance}
                          name={'slugUrl'}
                          label={'Slug Url'}
                          placeholder={'Enter the Slug URL'}
                          isSmall={true}
                          isReq={true}
                          className='w-[500px]'
                        />
                      </div>

                      <div className='w-[500px]'>
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
