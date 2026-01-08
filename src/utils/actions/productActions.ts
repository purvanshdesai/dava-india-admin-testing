'use client'
import api from '@/lib/axios'

export async function createProduct(formData: any) {
  try {
    const axiosRes = await api.post('/super-admin/products', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function createProductsVariation(formData: any) {
  try {
    const axiosRes = await api.post('/super-admin/product-variations', formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateProduct(formData: any) {
  try {
    const { _id, ...data } = formData
    const axiosRes = await api.patch(`/super-admin/products/${_id}`, data)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchProductDetails(productId: string) {
  if (productId === 'new') return null
  try {
    const axiosRes = await api.get(`/super-admin/products/${productId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function fetchProducts(query: any = {}) {
  try {
    const reqQuery: any = {
      $limit: query.$limit || 10, // Default limit to 10 if undefined
      $skip: query.$skip || 0, // Default skip to 0 if undefined
      showProductStock: query?.showProductStock ?? null,
      consumerZipCode: query?.consumerZipCode ?? null
    }

    const sanitize = (value: string) =>
      value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

    if (query?.searchText) {
      reqQuery['$or'] = [
        { title: { $regex: sanitize(query?.searchText), $options: 'i' } },
        { sku: { $regex: sanitize(query?.searchText), $options: 'i' } }
      ]
    }

    if (query.filters) {
      for (const filter of query.filters) {
        if (filter.id == 'title') {
          reqQuery['$or'] = [
            { title: { $regex: sanitize(filter.value), $options: 'i' } },
            { sku: { $regex: sanitize(filter.value), $options: 'i' } }
          ]
        }
        if (filter.id == 'isActive') reqQuery.isActive = { $in: filter.value }
        if (filter.id == 'collections')
          reqQuery.collections = { $in: filter.value }
        if (filter.id == 'saltType') reqQuery.saltType = { $in: filter.value }
        if (filter.id == 'consumption')
          reqQuery.consumption = { $in: filter.value }
      }
    }

    const axiosRes = await api.get('/super-admin/products', {
      params: reqQuery
    })

    return axiosRes?.data
  } catch (e) {
    console.error('Error fetching products:', e)
    throw e
  }
}

export async function deleteProduct(productId: string) {
  try {
    const axiosRes = await api.delete(`/super-admin/products/${productId}`)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function createProductVariation(formData: any) {
  try {
    const axiosRes = await api.post(`/super-admin/product-variations`, formData)

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function updateProductVariation(formData: any) {
  try {
    const { _id, ...data } = formData
    const axiosRes = await api.patch(
      `/super-admin/product-variations/${_id}`,
      data
    )

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

// export async function fetchVariationDetails(variationId: string) {
//   if (variationId === 'new') return null
//   try {
//     const axiosRes = await api.get(
//       `/super-admin/product-variationss/${productId}/variations/${variationId}`
//     )

//     return axiosRes?.data
//   } catch (e) {
//     console.log(e)
//     throw e
//   }
// }
export async function fetchVariationDetailsById(
  variationId: string,
  getProducts: boolean = false
) {
  if (variationId === 'new') return null
  try {
    const axiosRes = await api.get(
      `/super-admin/product-variations/${variationId}?getProducts=${getProducts}`
    )

    return axiosRes?.data
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const productInfoGen = async (data: {
  productName: string
  productCompositions: string
  productDescription: string
}) => {
  try {
    const res = await api.post('/chatgpt-product-info-generation', { ...data })
    return res.data
  } catch (error) {
    throw error
  }
}

export async function fetchCollectionProducts(collection: any) {
  try {
    const axiosRes = await api.get('/super-admin/collection/products', {
      params: {
        collections: collection
      }
    })

    return axiosRes?.data
  } catch (e) {
    console.error('Error fetching products:', e)
    throw e
  }
}
