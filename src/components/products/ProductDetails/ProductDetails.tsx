import GeneralInfo from '@/components/products/ProductDetails/GeneralInfo'
import AboutProduct from '@/components/products/ProductDetails/AboutProduct'
import SEODetails from '@/components/products/ProductDetails/SEODetails'
import CustomTabs from '@/components/products/CustomTabs'
import { useEffect, useState } from 'react'
import { useFooter } from '@/context/Footer'
import { useCreateProduct, usePatchProduct } from '@/utils/hooks/productHooks'
import { variationSchema, variationCategoriesSchema } from '@/lib/zod'
import { object, z } from 'zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Footer from '@/components/products/ProductDetails/Footer'
import { redirect, useSearchParams } from 'next/navigation'
import { Form } from '@/components/ui/form'
import LoadingSpinner from '@/components/LoadingSpinner'
import { removeFiles, uploadFiles } from '@/utils/utils/fileUpload'
import { useToast } from '@/hooks/use-toast'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

const ProductDetails = ({
  productDetails,
  variationCategoryValues,
  variationId
}: {
  productDetails: z.infer<typeof variationSchema>
  variationCategoryValues?: z.infer<typeof variationCategoriesSchema>
  variationId?: string
}) => {
  const { setFooterContent } = useFooter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const [loading, setLoading] = useState(false)
  const [hasReadPermission, setHasReadPermission] = useState<boolean>(false)

  const readPermission = hasPermission(
    MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
    MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.READ_PRODUCT
  )
  const editPermission = hasPermission(
    MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.key,
    MODULES_PERMISSIONS.PRODUCT_MANAGEMENT.permissions.EDIT_PRODUCT
  )
  useEffect(() => {
    if (readPermission && !editPermission) {
      setHasReadPermission(readPermission)
    }
  }, [readPermission, editPermission])

  const {
    mutate: createProduct,
    isPending: isCreatePending,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
    error: createError
  } = useCreateProduct()
  const {
    mutate: patchProduct,
    isSuccess: isPatchSuccess,
    isPending: isPatchPending,
    isError: isPatchError,
    error: patchError
  } = usePatchProduct()

  const [modifiedImageFile, setModifiedImageFiles] = useState<any>({
    newFiles: [],
    removedFiles: [],
    imagesOrder: []
  })

  const [currentTab, setCurrentTab] = useState('general')

  const defaultVariationValues = Object.entries(
    variationCategoryValues ?? {}
  ).reduce<Record<string, string>>((acc, [key, value]) => {
    if (Array.isArray(value)) acc[key] = value[0]
    return acc
  }, {})

  const schemaWithVariationCategories = variationSchema
    .extend({
      variation: variationCategoryValues
        ? object({
            ...Object.keys(variationCategoryValues).reduce<
              Record<string, z.ZodString>
            >((acc, key) => {
              acc[key] = z
                .string({ required_error: `Select value for ${key}` })
                .min(1)
              return acc
            }, {})
          })
        : z.object({})
    })
    .refine(
      data => {
        const discountType = data.discountType
        const mrp = Number(data.maximumRetailPrice ?? 0)
        const discount = Number(data.discount ?? 0)

        const finalPrice = calculateFinalPrice(mrp, discountType, discount)

        return Number(data.finalPrice) == finalPrice
      },
      {
        path: ['finalPrice'],
        message:
          'Final Price should be equal to Maximum Retail Price minus Discount lt'
      }
    )

  const form = useForm<z.infer<typeof schemaWithVariationCategories>>({
    resolver: zodResolver(schemaWithVariationCategories),
    defaultValues: productDetails ?? {
      title: '',
      description: '',
      minOrderQuantity: 1,
      maxOrderQuantity: 10,
      collections: [],
      compositions: '',
      searchSuggestionKeywords: [],
      brandTags: [],
      sku: '',
      seo: {
        url: '',
        metaTitle: '',
        metaDescription: '',
        keywords: []
      },
      unitPrice: 0,
      maximumRetailPrice: 0,
      discount: 0,
      discountType: 'flat',
      finalPrice: 0,
      images: [],
      thumbnail: '',
      associatedProducts: [],
      isActive: true,
      hasVariation: !!variationCategoryValues?._id,
      aboutProduct: {
        info: '',
        drugInteraction: '',
        suitableFor: [],
        dosage: [],
        cautions: '',
        benefits: [],
        productInfo: '',
        sellerInfo: '',
        manufacturerInfo: '',
        packagedByInfo: '',
        directionsForUse: ''
      },
      selectedSections: [],
      variation: {
        ...defaultVariationValues
      },
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
      },
      hsnNumber: null,
      consumption: null,
      scheduledDrug: 'None',
      saltType: 'None'
    }
  })

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

  async function onSubmit(
    values: z.infer<typeof schemaWithVariationCategories>
  ) {
    try {
      setLoading(true)
      const images = await handleImageUpload()

      values.images = images

      if (!values.thumbnail || !/^(https?:\/\/)/.test(values.thumbnail)) {
        const img = values.thumbnail
          ? images.find(
              (img: any) =>
                img &&
                img?.objectDetails?.originalFileName === values?.thumbnail
            )
          : images[0]
        if (img) values.thumbnail = img.objectUrl as string
      }

      if (variationId) values.variationId = variationId
      if (!values?.consumption) values.consumption = null

      console.log('Product Details', values)

      if (productDetails?._id) {
        patchProduct(values)
      } else {
        createProduct(values)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const onError = (errors: any) => {
    const fields = Object.keys(errors)
    if (fields.length) {
      const field = fields[0]
      for (const tab of tabs) {
        if (tab.fields.includes(field)) {
          setCurrentTab(tab.value)
          break
        }
      }
    }
  }

  const tabs = [
    {
      name: 'General Information',
      value: 'general',
      content: (
        <GeneralInfo
          variationCategoryValues={variationCategoryValues}
          modifiedImageFilesState={[modifiedImageFile, setModifiedImageFiles]}
          form={form as unknown as UseFormReturn}
          hasReadOnly={hasReadPermission}
        />
      ),
      fields: [
        'title',
        'subCategoryId',
        'sku',
        'description',
        'compositions',
        'tags',
        'images',
        'thumbnail',
        'variation',
        'associatedProducts',
        'unitPrice',
        'maximumRetailPrice',
        'discount',
        'finalPrice',
        'taxes',
        'isActive',
        'prescriptionReq'
      ]
    },
    {
      name: 'About Products',
      value: 'dashboard',
      content: (
        <AboutProduct
          form={form as unknown as UseFormReturn}
          hasReadOnly={hasReadPermission}
        />
      ),
      fields: ['aboutProduct', 'selectedSections']
    },
    {
      name: 'SEO',
      value: 'seo',
      content: (
        <SEODetails
          form={form as unknown as UseFormReturn}
          hasReadOnly={hasReadPermission}
        />
      ),
      fields: ['seo']
    }
  ]

  const handleImageUpload = async () => {
    // TODO get current files array
    const { newFiles, removedFiles, imagesOrder } = modifiedImageFile

    const removedFilesUrls = removedFiles.map((rf: any) => rf.url)
    if (removedFiles?.length) {
      await removeFiles(removedFilesUrls)
    }

    let uploadedFiles = []
    if (newFiles?.length) {
      uploadedFiles = await uploadFiles(newFiles)
      console.log('uploadedFiles', uploadedFiles)
    }
    const imagesField = (form.getValues('images') ?? []).filter(
      (obj: any) => !removedFilesUrls.includes(obj.objectUrl)
    )

    const imagesOrderField = imagesOrder.map((imgOrder: any) => {
      if (imgOrder.isExisting) {
        return imagesField.find(img => img.objectUrl === imgOrder.url)
      } else {
        return uploadedFiles.find((upImg: any) =>
          imgOrder?.fileName?.includes(upImg.objectDetails.originalFileName)
        )
      }
    })

    return imagesOrderField
  }

  useEffect(() => {
    setFooterContent(
      <Footer
        loading={loading}
        disabled={hasReadPermission}
        form={form as unknown as UseFormReturn}
        onSubmit={onSubmit as (values: unknown) => void}
        onError={onError as (values: unknown) => void}
      />
    )
  }, [form, modifiedImageFile])

  useEffect(() => {
    if (isCreateSuccess || isPatchSuccess) {
      if (variationId) {
        if (page && limit)
          redirect(
            `/products/variations/${variationId}?page=${page}&limit=${limit}`
          )
        else redirect(`/products/variations/${variationId}`)
      } else {
        if (page && limit) redirect(`/products?page=${page}&limit=${limit}`)
        else redirect(`/products`)
      }
    }
  }, [isCreateSuccess, isPatchSuccess])

  useEffect(() => {
    let message
    if (isCreateError) {
      message = (createError as any)?.response?.data?.message
    }
    if (isPatchError) {
      message = (patchError as any)?.response?.data?.message
    }
    if (message) toast({ title: 'Error', description: message })
  }, [isCreateError, isPatchError])

  useEffect(() => {
    return () => {
      setFooterContent(null)
    }
  }, [form, loading])

  return (
    <div className='py-1'>
      {isCreatePending || isPatchPending ? (
        <div>
          <LoadingSpinner />
        </div>
      ) : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <CustomTabs
            defaultValue={'general'}
            on
            tabs={tabs}
            value={currentTab}
            onValueChange={(tab: string) => setCurrentTab(tab)}
          />
        </form>
      </Form>
    </div>
  )
}
export default ProductDetails
