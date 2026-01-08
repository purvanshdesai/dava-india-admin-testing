// import { useGetAllCategories } from '@/utils/hooks/categoryHook'
// import LoadingSpinner from '@/components/LoadingSpinner'
import FormInputField from '@/components/form/FormInputField'
import FormComboboxField from '@/components/form/FormComboboxField'
import FormSwitchField from '@/components/form/FormSwitchField'
import { z } from 'zod'
import { variationCategoriesSchema } from '@/lib/zod'
import { UseFormReturn } from 'react-hook-form'
import FormStringArrayField from '@/components/form/FormStringArrayField'
import { useAllTaxes } from '@/utils/hooks/taxesHooks'
import Image from 'next/image'
import { useState } from 'react'
import AddAssociatedProductsModal from './AddAssociatedProductsModal'
import { ChevronRight, Languages, Trash2 } from 'lucide-react'
import DnDImageUpload from '@/components/form/DnDImageUpload'
import FormDialog from '@/components/form/FormDialogBox'
import CategoryTranslationForm from '@/components/category/CategoryTranslationForm'
import { DialogClose } from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import {
  useGetConsumptions,
  useGetSupportedLanguages
} from '@/utils/hooks/appDataHooks'
// import { useGetAllCollections } from '@/utils/hooks/collectionsHooks'
import AddCategoriesModal from '@/components/sponsored/AddCategoriesModal'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const GeneralInfo = ({
  form,
  modifiedImageFilesState,
  variationCategoryValues,
  hasReadOnly
}: {
  form: UseFormReturn
  modifiedImageFilesState: any[]
  variationCategoryValues?: z.infer<typeof variationCategoriesSchema>
  hasReadOnly: boolean
}) => {
  const { data: taxes }: any = useAllTaxes({})
  const [products, setProducts] = useState(
    form.getValues('associatedProductDetails') ?? []
  )
  const [collectionsProducts, setCollectionsProducts] = useState(
    form.getValues('collectionsDetails') ?? []
  )
  const [showNameTranslation, setShowNameTranslation] = useState(false)
  const [showDescriptionTranslation, setShowDescriptionTranslation] =
    useState(false)
  const { data: languages }: any = useGetSupportedLanguages({})
  const { data: consumptions }: any = useGetConsumptions({})

  const [modifiedImageFile, setModifiedImageFiles] = modifiedImageFilesState

  const handleAddProduct = (value: any) => {
    const filterData: any = value.map((t: any) => t._id)

    const existingData: any =
      form.getValues('associatedProductDetails')?.map((i: any) => i._id) ?? []

    const combinedData: any = [...existingData, ...filterData]
    form.setValue('associatedProducts', Array.from(new Set(combinedData)))
    setProducts([...products, ...value])
  }

  const handleAddCollectionProduct = (value: any) => {
    const filterData: any = value.map((t: any) => t._id)

    const existingData: any = form.getValues('collections') ?? []

    const combinedData: any = [...existingData, ...filterData]
    form.setValue('collections', Array.from(new Set(combinedData)))
    setCollectionsProducts([...collectionsProducts, ...value])
  }

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = products.filter((_: any, i: any) => i !== index)

    const existingData =
      form?.getValues('associatedProductDetails')?.map((i: any) => i._id) ?? []

    const filteredData = existingData.filter((_: any, i: any) => i !== index)

    form.setValue('associatedProducts', Array.from(new Set(filteredData)))

    setProducts(updatedProducts)
  }

  const handleDeleteCollectionProduct = (id: number) => {
    const updatedProducts = collectionsProducts.filter(
      (product: any) => product._id !== id
    )

    // Update the form field (collections) with filtered IDs
    const existingData = form.getValues('collections') ?? []
    const filteredData = existingData.filter(
      (collectionId: any) => collectionId !== id
    )

    // Update both form and UI state properly
    form.setValue('collections', filteredData)
    setCollectionsProducts(updatedProducts)
  }

  const toggleNameTranslation: any = () => {
    if (showDescriptionTranslation) setShowDescriptionTranslation(false)
    setShowNameTranslation(!showNameTranslation)
  }
  const getImagesField = () => {
    const images = form.getValues('images')
    if (!images?.length) return []

    return images
      .map((o: any) => o.objectUrl)
      .filter(
        (url: string) =>
          modifiedImageFile.removedFiles.findIndex(
            (img: any) => img.url === url
          ) === -1
      )
  }

  const calculateFinalPrice = (
    mrp: number,
    discountType: 'flat' | 'percentage',
    discount: number
  ) => {
    let finalPrice = mrp
    if (discount) {
      discount = Number(discount)

      let discountValue = discount
      if (discountType === 'percentage') discountValue = mrp * (discount / 100)

      if (discountValue <= mrp) finalPrice = mrp - discountValue
    }
    return finalPrice
  }

  return (
    <div className='mt-4 flex h-[80vh] flex-col gap-4 overflow-auto p-1'>
      <div className={'text-lg font-semibold'}>Variation Information</div>
      <div className='container m-auto grid grid-cols-2 gap-8'>
        <div className='flex flex-row items-center justify-start'>
          <div className='mr-3 w-[90%]'>
            <FormInputField
              isSmall={true}
              formInstance={form}
              placeholder='Enter the Product Variation Name'
              name={'title'}
              label={'Product Name'}
              isReq={true}
              disabled={hasReadOnly}
            />
          </div>
          {
            <FormDialog
              content={
                <CategoryTranslationForm
                  type='title'
                  formInstance={form}
                  translationValues={languages?.sort((a: any, b: any) =>
                    a.name.localeCompare(b.name)
                  )}
                  translateType='productTranslate'
                  translationFor='product name'
                  disabled={hasReadOnly}
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
              title={'Product Name Translation'}
              footerActions={() => (
                <div className='flex items-center gap-3'>
                  <DialogClose>
                    <Button variant='secondary' onClick={() => form.reset()}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose disabled={hasReadOnly}>
                    <Button disabled={hasReadOnly}>Save</Button>
                  </DialogClose>
                </div>
              )}
            />
          }
        </div>

        <FormInputField
          isReq={true}
          isSmall={true}
          formInstance={form}
          placeholder='Enter the SKU'
          name={'sku'}
          label={'SKU'}
          disabled={hasReadOnly}
        />

        <div className='col-span-2 grid grid-cols-2 items-center gap-6'>
          <div className='flex items-center justify-start'>
            <div className='mr-3 w-[90%]'>
              <FormInputField
                isSmall={true}
                placeholder='Enter the quantity/volume'
                formInstance={form}
                name={'description'}
                label={'Quantity / Volume'}
                disabled={hasReadOnly}
              />
              {/* <p className='text-sm'>{productDescription.length}/300</p> */}
            </div>
            {
              <FormDialog
                content={
                  <CategoryTranslationForm
                    type='description'
                    formInstance={form}
                    translationValues={languages?.sort((a: any, b: any) =>
                      a.name.localeCompare(b.name)
                    )}
                    formType='textarea'
                    translationFor='product description'
                    disabled={hasReadOnly}
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
                title={'Description Translation'}
                footerActions={() => (
                  <div className='flex items-center gap-3'>
                    <DialogClose>
                      <Button variant='secondary' onClick={() => form.reset()}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose disabled={hasReadOnly}>
                      <Button disabled={hasReadOnly}>Save</Button>
                    </DialogClose>
                  </div>
                )}
              />
            }
          </div>

          <div className='pl-2'>
            <FormInputField
              isSmall={true}
              formInstance={form}
              placeholder='Enter the compositions'
              label={'Compositions'}
              name={'compositions'}
              isReq={true}
              disabled={hasReadOnly}
            />
          </div>
        </div>

        <div className='col-span-2 grid grid-cols-2 gap-6'>
          <div>
            <FormField
              control={form.control}
              name='minOrderQuantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      placeholder='Enter minimum order quantity'
                      {...field}
                      disabled={hasReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name='maxOrderQuantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Order Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      placeholder='Enter minimum order quantity'
                      {...field}
                      disabled={hasReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormComboboxField
              isSmall={true}
              formInstance={form}
              label={'Consumption'}
              name={'consumption'}
              multiple={false}
              items={consumptions?.map((value: any) => ({
                value: value._id,
                label: value.label
              }))}
              className={'w-full'}
              disabled={hasReadOnly}
            />
          </div>
          <div>
            <FormComboboxField
              isSmall={true}
              formInstance={form}
              label={'Scheduled Drug'}
              name={'scheduledDrug'}
              multiple={false}
              items={['Scheduled H', 'Scheduled H1', 'None']?.map(
                (value: any) => ({
                  value: value,
                  label: value
                })
              )}
              className={'w-full'}
              disabled={hasReadOnly}
            />
          </div>
          <div>
            <FormComboboxField
              isSmall={true}
              formInstance={form}
              label={'Salt Type'}
              name={'saltType'}
              multiple={false}
              items={['Single Salt', 'Multi Salt', 'None']?.map(
                (value: any) => ({
                  value: value,
                  label: value
                })
              )}
              className={'w-full'}
              disabled={hasReadOnly}
            />
          </div>
          <div>
            <FormComboboxField
              isSmall={true}
              formInstance={form}
              label={'Salt Type'}
              name={'saltType'}
              multiple={false}
              items={['Single Salt', 'Multi Salt', 'None']?.map(
                (value: any) => ({
                  value: value,
                  label: value
                })
              )}
              className={'w-full'}
            />
          </div>
        </div>

        <div className='col-span-2'>
          <div className=''>
            <p className='font-semibold text-black'>
              Collections
              {/* {form.formState.errors && form.formState.errors?.collections && (
                <span className='px-3 text-xs text-red-600'>
                  Error: Minimum 1 category should be selected!
                </span>
              )} */}
            </p>
            <div
              className='w-full space-y-3 overflow-y-auto'
              style={{ maxHeight: 'calc(100vh - 220px)' }}
            >
              <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2'>
                {collectionsProducts?.map((category: any, index: any) => (
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
                      {!hasReadOnly && (
                        <div className='mt-2 flex justify-end sm:mt-0'>
                          <div
                            className='cursor-pointer text-xs text-red-500 hover:text-red-600'
                            onClick={() =>
                              handleDeleteCollectionProduct(category._id)
                            }
                          >
                            <Trash2 size={18} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-5'>
              {!hasReadOnly && (
                <AddCategoriesModal
                  AddCategory={(value: any) =>
                    handleAddCollectionProduct(value)
                  }
                  alreadyExistCategoryIds={form.getValues('collections')}
                />
              )}
            </div>
          </div>
        </div>

        <div className='col-span-2'>
          <FormStringArrayField
            formInstance={form}
            placeholder='Enter search keywords'
            name={'tags'}
            label={'Tags'}
            disabled={hasReadOnly}
            // isSuggestion={true}
            // suggestionValues={['dexamethasone', 'metronidazole', 'amoxicillin']}
          />
        </div>

        <div className='col-span-2'>
          <FormStringArrayField
            formInstance={form}
            placeholder='Enter Simile Brands'
            name={'brandTags'}
            label={'Similar Brands'}
            disabled={hasReadOnly}
            // isSuggestion={true}
            // suggestionValues={['dexamethasone', 'metronidazole', 'amoxicillin']}
          />
        </div>

        <div className={'col-span-2'}>
          <p className='text-base font-medium'>Product Images</p>
          <DnDImageUpload
            multiple={true}
            existingFiles={getImagesField()}
            onUploadNewFiles={(files: Array<File>) => {
              setModifiedImageFiles((prevData: any) => ({
                ...prevData,
                newFiles: [...prevData.newFiles, ...files]
              }))
            }}
            onRemoveFile={(res: any) => {
              if (res.preview && !res.isExisting) {
                setModifiedImageFiles({
                  ...modifiedImageFile,
                  newFiles: modifiedImageFile.newFiles.filter(
                    (f: any) => f.preview !== res.preview
                  )
                })
              }
              if (res.isExisting)
                setModifiedImageFiles({
                  ...modifiedImageFile,
                  removedFiles: [...modifiedImageFile.removedFiles, res]
                })
            }}
            onClickImage={(res: any) => {
              if (res.isExisting) form.setValue('thumbnail', res.url)
              else form.setValue('thumbnail', res.path)
            }}
            preSelectedImage={form.getValues('thumbnail')}
            onFileOrderChange={(files: any) => {
              setModifiedImageFiles({
                ...modifiedImageFile,
                imagesOrder: files
              })
            }}
            disabled={hasReadOnly}
          />
        </div>

        {variationCategoryValues &&
          Object.entries(variationCategoryValues).map((entry: any) => {
            const [cat, values]: any = entry
            return (
              <FormComboboxField
                isSmall={true}
                key={cat}
                formInstance={form}
                label={cat}
                name={`variation.${cat}`}
                items={values.map((value: any) => ({ value, label: value }))}
                className={'w-full'}
                isReq={true}
                disabled={hasReadOnly}
              />
            )
          })}
      </div>
      <div className='w-full py-3'>
        <p className='font-semibold text-black'>Associated Products</p>
        <div className='grid grid-cols-2 gap-x-6'>
          {products?.map((product: any, index: any) => (
            <div className='mt-5' key={index}>
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
                      {product.title?.slice(0, 70)}
                    </p>
                    <p className='text-xs font-medium text-[#888888]'>
                      {product.description?.slice(0, 70)}
                    </p>
                  </div>
                </div>
                <div>
                  {!hasReadOnly && (
                    <div className='flex flex-row items-center justify-between'>
                      <div
                        className='mr-2 cursor-pointer'
                        onClick={() => handleDeleteProduct(index)}
                      >
                        Delete
                      </div>
                      <ChevronRight width={18} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!hasReadOnly && (
          <div className='mt-5'>
            <AddAssociatedProductsModal
              AddProduct={(value: any) => handleAddProduct(value)}
              alreadyExistProductIds={form.getValues('associatedProducts')}
            />
          </div>
        )}
      </div>
      <div className='col-span-2 space-y-4'>
        <div className={'text-lg font-semibold'}>Price Information</div>
        <div className='container m-auto grid grid-cols-2 gap-x-6 gap-y-4'>
          <FormInputField
            isSmall={true}
            formInstance={form}
            name={'unitPrice'}
            label={'Unit Price'}
            type={'number'}
            isReq={true}
            disabled={hasReadOnly}
          />
          <FormInputField
            isSmall={true}
            formInstance={form}
            name={'maximumRetailPrice'}
            label={'MRP (Maximum Retail Price)'}
            type={'number'}
            onBlur={e => {
              const mrp = e.target.value ?? 0
              const discount = form.getValues('discount') ?? 0
              const discountType = form.getValues('discountType')
              const finalPrice = calculateFinalPrice(
                Number(mrp),
                discountType,
                Number(discount)
              )

              form.setValue('finalPrice', finalPrice)
            }}
            isReq={true}
            disabled={hasReadOnly}
          />
          <div className='w-full'>
            <FormField
              control={form?.control}
              disabled={hasReadOnly}
              name={'discount'}
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel
                    className={cn('text-sm', 'text-black dark:text-gray-300')}
                  >
                    Discount
                  </FormLabel>
                  <FormControl>
                    <div className={'flex w-full gap-3'}>
                      <div className='flex-1'>
                        <Select
                          disabled={hasReadOnly}
                          defaultValue={'flat'}
                          value={form.watch('discountType')}
                          onValueChange={(
                            discountType: 'flat' | 'percentage'
                          ) => {
                            form.setValue('discountType', discountType)

                            const discount = form.watch('discount')
                            const mrp = form.watch('maximumRetailPrice') ?? 0
                            form.setValue(
                              'finalPrice',
                              `${calculateFinalPrice(Number(mrp), discountType, Number(discount))}`
                            )
                          }}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Type' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='flat'>Flat</SelectItem>
                            <SelectItem value='percentage'>
                              Percentage
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='flex-1'>
                        <Input
                          {...field}
                          className={cn('w-full rounded-lg dark:text-gray-300')}
                          type={'number'}
                          onBlur={e => {
                            const discount = e.target.value
                            const mrp =
                              form.getValues('maximumRetailPrice') ?? 0
                            const finalPrice = calculateFinalPrice(
                              Number(mrp),
                              form.watch('discountType'),
                              Number(discount)
                            )
                            form.setValue('finalPrice', finalPrice)
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormInputField
            isSmall={true}
            formInstance={form}
            name={'finalPrice'}
            label={'Final Price'}
            type={'number'}
            disabled={true}
            isReq={true}
          />
          <div>
            <FormComboboxField
              isSmall={true}
              formInstance={form}
              label={'Tax'}
              name={'taxes'}
              multiple={true}
              items={taxes?.data.map((value: any) => ({
                value: value._id,
                label: value.name
              }))}
              className={'w-full'}
              disabled={hasReadOnly}
            />
          </div>

          <div className='pl-2'>
            <FormInputField
              isSmall={true}
              formInstance={form}
              placeholder='Enter HSN Number'
              label={'HSN Number'}
              name={'hsnNumber'}
              isReq={false}
              disabled={hasReadOnly}
            />
          </div>
        </div>
      </div>

      <div className='col-span-2 space-y-4 pt-6'>
        <div className={'text-lg font-semibold'}>Status and Prescription</div>

        <FormSwitchField
          isSmall={true}
          name={'isActive'}
          formInstance={form}
          label={'Active'}
          disabled={hasReadOnly}
        />
        <FormSwitchField
          isSmall={true}
          name={'prescriptionReq'}
          formInstance={form}
          label={'Prescription Required'}
          disabled={hasReadOnly}
        />
      </div>

      <div className='col-span-2 py-12'></div>
    </div>
  )
}

export default GeneralInfo
