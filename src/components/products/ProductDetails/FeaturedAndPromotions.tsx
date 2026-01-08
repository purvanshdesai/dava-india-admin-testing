import FormSelectField from '@/components/form/FormSelectField'
import React, { useState } from 'react'
import FormUploadField from '@/components/form/FormUploadField'
import { useGetCategories } from '@/utils/hooks/categoryHook'
import { ChevronRight } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { UseFormReturn } from 'react-hook-form'
import Image from 'next/image'
import AddAssociatedProductsModal from './AddAssociatedProductsModal'
const FeaturePromotions = ({ form }: { form: UseFormReturn }) => {
  const { data: featuredListData, isPending: isFeaturedListPending } =
    useGetCategories({
      $paginate: false,
      filters: [{ id: 'type', value: 'subCategory' }]
    })
  const { data: promotionListData, isPending: isPromotionListPending } =
    useGetCategories({
      $paginate: false,
      filters: [{ id: 'type', value: 'subCategory' }]
    })

  const [products, setProducts] = useState(
    form.getValues('associatedProductDetails') ?? []
  )
  const handleAddProduct = (value: any) => {
    const filterData: any = value.map((t: any) => t._id)

    const existingData: any =
      form?.getValues('associatedProductDetails')?.map((i: any) => i._id) ?? []

    const combinedData: any = [...existingData, ...filterData]
    form.setValue('associatedProducts', Array.from(new Set(combinedData)))
    setProducts([...products, ...value])
  }
  const handleDeleteProduct = (index: number) => {
    const updatedProducts = products.filter((_: any, i: any) => i !== index)

    const existingData = form
      .getValues('associatedProductDetails')
      .map((i: any) => i._id)

    const filteredData = existingData.filter((_: any, i: any) => i !== index)

    form.setValue('associatedProducts', Array.from(new Set(filteredData)))

    setProducts(updatedProducts)
  }

  if (isFeaturedListPending || isPromotionListPending)
    return (
      <div>
        <LoadingSpinner />
      </div>
    )

  return (
    <div className='h-[529px]'>
      <div className='my-4'>
        <h2 className='text-lg font-semibold tracking-tight'>
          Featured & Promotions
        </h2>
      </div>
      <div className='flex w-[50%] flex-col gap-8'>
        <FormSelectField
          isReq={true}
          isSmall={true}
          formInstance={form}
          label={'Featured Lists'}
          name={'featuredListId'}
          items={(featuredListData as any)?.map((c: any) => ({
            label: c.name,
            value: c._id
          }))}
          className={'w-full'}
        />
        <FormSelectField
          isSmall={true}
          formInstance={form}
          label={'Promotion'}
          name={'promotionId'}
          items={(promotionListData as any)?.map((c: any) => ({
            label: c.name,
            value: c._id
          }))}
          className={'w-full'}
        />

        <FormUploadField
          isReq={true}
          isSmall={true}
          formInstance={form}
          name={'bannerImage'}
          label={'Thumbnail Image'}
        />

        <div>
          <p className='font-semibold text-black'>Associated Products</p>
          {products &&
            products?.map((product: any, index: any) => (
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
                        {product.title}
                      </p>
                      <p className='text-xs font-medium text-[#888888]'>
                        {product.description}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className='flex flex-row items-center justify-between'>
                      <div
                        className='mr-2 cursor-pointer'
                        onClick={() => handleDeleteProduct(index)}
                      >
                        Delete
                      </div>
                      <ChevronRight width={18} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          <div className='mt-5'>
            <AddAssociatedProductsModal
              AddProduct={(value: any) => handleAddProduct(value)}
              alreadyExistProductIds={form.getValues('associatedProducts')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturePromotions
