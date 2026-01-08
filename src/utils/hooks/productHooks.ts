import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  createProductsVariation,
  createProductVariation,
  deleteProduct,
  fetchCollectionProducts,
  fetchProductDetails,
  fetchProducts,
  fetchVariationDetailsById,
  productInfoGen,
  updateProduct,
  updateProductVariation
} from '@/utils/actions/productActions'

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: createProduct
  })
}

// createProductsVariation
export const useCreateProductsVariation = () => {
  return useMutation({
    mutationFn: createProductsVariation
  })
}

export const usePatchProduct = () => {
  return useMutation({
    mutationFn: updateProduct
  })
}

export const useFetchProductDetails = (productId: string) => {
  return useQuery({
    queryKey: ['fetch-product-details', productId],
    queryFn: () => fetchProductDetails(productId),
    gcTime: 0
  })
}

export const useFetchProducts = (query?: any) => {
  return useQuery({
    queryFn: () => fetchProducts(query),
    queryKey: ['fetch-products', query],
    gcTime: 0
  })
}
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetch-products'] })
    }
  })
}

export const useCreateVariation = () => {
  return useMutation({
    mutationFn: createProductVariation
  })
}

export const usePatchVariation = () => {
  return useMutation({
    mutationFn: updateProductVariation
  })
}

export const useFetchVariationDetailsById = (
  variationId: string,
  getProducts: boolean = false
) => {
  return useQuery({
    queryKey: ['fetch-variation-details-id', getProducts],
    queryFn: () => fetchVariationDetailsById(variationId, getProducts),
    gcTime: 0
  })
}

export const useProductInfoGen = () => {
  return useMutation({
    mutationFn: productInfoGen
  })
}

export const useFetchCollectionProducts = (collection?: any) => {
  return useQuery({
    queryFn: () => fetchCollectionProducts(collection),
    queryKey: ['fetch-collection-products', collection],
    gcTime: 0
  })
}
