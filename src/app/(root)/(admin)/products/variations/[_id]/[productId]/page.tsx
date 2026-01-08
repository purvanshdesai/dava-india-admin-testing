'use client'
import { useParams } from 'next/navigation'
import {
  useFetchProductDetails,
  useFetchVariationDetailsById
} from '@/utils/hooks/productHooks'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProductDetails from '@/components/products/ProductDetails/ProductDetails'

const ProductDetailsPage = () => {
  const params = useParams<{ _id: string; productId: string }>()

  const { data: productDetails, isPending } = useFetchProductDetails(
    params.productId
  )
  const { data: variationDetails, isPending: isVariationDetailsPending } =
    useFetchVariationDetailsById(params._id)

  if (isPending || isVariationDetailsPending)
    return (
      <div>
        <LoadingSpinner />
      </div>
    )

  return (
    <div>
      <ProductDetails
        productDetails={productDetails}
        variationCategoryValues={variationDetails?.variationCategoryValues}
        variationId={variationDetails?._id}
      />
    </div>
  )
}

export default ProductDetailsPage
