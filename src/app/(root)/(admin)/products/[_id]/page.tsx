'use client'
import { useParams } from 'next/navigation'
import { useFetchProductDetails } from '@/utils/hooks/productHooks'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProductDetails from '@/components/products/ProductDetails/ProductDetails'
import AppBreadcrumb from '@/components/Breadcrumb'

const ProductDetailsPage = () => {
  const params = useParams<{ _id: string }>()

  const { data: productDetails, isPending } = useFetchProductDetails(params._id)

  if (isPending)
    return (
      <div>
        <LoadingSpinner />
      </div>
    )

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Products', href: '/products' },
            {
              page: productDetails
                ? (productDetails?.title ?? '')
                : 'Add New Product'
            }
          ]}
        />
      </div>
      <ProductDetails productDetails={productDetails} />
    </div>
  )
}

export default ProductDetailsPage
