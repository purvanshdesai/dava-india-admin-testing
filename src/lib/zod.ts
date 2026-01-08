import {
  any,
  array,
  boolean,
  coerce,
  date,
  number,
  object,
  z,
  record,
  string,
  unknown
} from 'zod'
import dayjs from 'dayjs'

export const signInSchema = object({
  email: string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .min(3, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters')
})

export const storeForgotPasswordSchema = object({
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Invalid email' })
    .min(1, { message: 'Email is required' })
})

export const variationCategoriesSchema = object({
  _id: string(),
  variationCategories: array(string()),
  variationCategoryValues: record(array(string()))
})

export const variationSchema = object({
  _id: string().optional(),
  // productId: string({ required_error: 'Product ID is required' }).optional(),
  title: string({ required_error: 'Variation name is required' })
    .min(3)
    .max(100),
  description: string().max(300, {
    message: 'Maximum 300 characters are allowed'
  }),
  minOrderQuantity: coerce
    .number({ required_error: 'Minimum Order Quantity is required' })
    .gt(0),
  maxOrderQuantity: coerce
    .number({ required_error: 'Maximum Order Quantity is required' })
    .gt(0),
  collections: array(string()).optional(),
  compositions: string({ required_error: 'Compositions is required' }).min(1),
  searchSuggestionKeywords: array(
    string({ required_error: 'Search suggestion keyword is required' })
  ),
  tags: array(string({ required_error: 'Tags are required' }))
    .min(0, 'Tags are required')
    .optional(),
  brandTags: array(string({ required_error: 'Brands are required' }))
    .min(0, 'Brands are required')
    .optional(),
  sku: string({ required_error: 'SKU is required' }).min(1, 'SKU is required'),
  seo: object({
    url: string({ required_error: 'Slug URL is required' })
      .regex(/^[a-zA-Z0-9_-]*$/, {
        message:
          'Only alphanumeric characters, underscores, and hyphens are allowed.'
      })
      .min(1, 'Slug URL is required'),
    metaTitle: string({ required_error: 'Meta title is required' }).min(1, {
      message: 'Meta title is required'
    }),
    metaDescription: string({ required_error: 'Meta description is required' }),
    keywords: array(string({ required_error: 'Keywords are required' }))
  }),
  unitPrice: coerce.number({ required_error: 'Unit price is required' }).gt(0),
  maximumRetailPrice: coerce
    .number({
      required_error: 'Maximum retail price is required'
    })
    .gt(0),
  discountType: z.enum(['flat', 'percentage']),
  discount: coerce.number({ required_error: 'Discount is required' }).gte(0),
  finalPrice: coerce
    .number({ required_error: 'Final price is required' })
    .gt(0),
  images: array(record(unknown())).optional(),
  thumbnail: string(),
  // bannerImage: record(unknown()),
  associatedProducts: array(
    string({ required_error: 'Associated product is required' })
  ),
  featuredListId: string().optional(),
  promotionId: string().optional(),
  // categoryId: string().optional(),
  subCategoryId: string().optional(),
  isActive: boolean(),
  prescriptionReq: boolean().optional(),

  variationId: string().optional(),
  hasVariation: boolean().optional(),
  aboutProduct: object({
    info: string().optional(),
    drugInteraction: string().optional(),
    suitableFor: array(string()).optional(),
    dosage: array(string()).optional(),
    cautions: array(string()).optional(),
    benefits: array(string()).optional(),
    sideEffects: array(string()).optional(),
    productInfo: string().optional(),
    sellerInfo: string().optional(),
    manufacturerInfo: string().optional(),
    packagedByInfo: string().optional(),
    directionsForUse: string().optional()
  }).optional(),
  taxes: array(string()).optional(),
  translations: any(),
  selectedSections: any(),
  hsnNumber: string().optional().nullable(),
  consumption: string().optional().nullable(),
  scheduledDrug: string().optional().nullable(),
  saltType: string().optional().nullable()
})

export const couponSchema = object({
  couponName: z
    .string({ required_error: 'Coupon name is required' })
    .min(3)
    .max(32),
  couponCode: z
    .string({ required_error: 'Coupon code is required' })
    .min(3, 'Coupon code must be at least 3 characters')
    .max(32, 'Coupon code must be at most 32 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Coupon code must be alphanumeric'),
  discountType: z.string(),
  description: z.string(),
  customUsageLimit: z.boolean().optional(),
  usageLimit: z.any(),
  discountValue: z.coerce
    .number({ required_error: 'Discount value is required' })
    .gt(0),
  maximumDiscountValue: z.coerce.number().optional(),
  minimumPurchaseValue: z.coerce
    .number({ required_error: 'Discount value is required' })
    .gt(0),
  products: z.array(z.string()).optional(),
  collections: z.array(z.string()).optional(),
  channels: z.string(),
  forEmails: z.array(z.string()).optional(),
  forPhoneNos: z.array(z.string()).optional(),
  active: z.boolean(),
  startDate: z.date().nullable().optional(),
  expiryDate: z.date().nullable().optional(),
  archive: z.boolean(),
  forUserType: z.string().optional(),
  deliveryPolicies: z.array(z.string()).optional(),
  isOfflineCoupon: z.boolean().optional()
}).superRefine((data, ctx) => {
  // Check the conditions for maximumDiscountValue
  if (
    data.discountType == 'percentage' &&
    (data.maximumDiscountValue == null || data.maximumDiscountValue <= 0)
  ) {
    ctx.addIssue({
      path: ['maximumDiscountValue'],
      code: z.ZodIssueCode.custom,
      message:
        'Maximum discount value is required and must be greater than 0 unless the discount type is fixedAmount'
    })
  }

  if (data.customUsageLimit) {
    const numericUsageLimit = Number(data.usageLimit)
    if (isNaN(numericUsageLimit) || numericUsageLimit <= 0) {
      ctx.addIssue({
        path: ['usageLimit'],
        code: z.ZodIssueCode.custom,
        message: 'Usage limit must be a number greater than 0 '
      })
    }
  } else {
    if (data.usageLimit !== 'oneTime' && data.usageLimit !== 'unlimited') {
      ctx.addIssue({
        path: ['usageLimit'],
        code: z.ZodIssueCode.custom,
        message: "Usage limit must be either 'oneTime' or 'unlimited' "
      })
    }
  }
})

export const categoriesSchema = object({
  name: string({ required_error: 'Category name is required' })
    .min(3)
    .max(36, { message: '36 characters are allowed for category name!' }),
  description: string()
    .max(180, {
      message: '180 characters are allowed for category description!'
    })
    .optional(),
  parent: string().nullable().optional(),
  image: string().optional(),
  modifiedImage: any(),
  displayOrder: z
    .string()
    .regex(/^\d+$/, { message: 'Display Order must be a positive integer' })
    .optional()
    .or(z.number().int().nonnegative()),
  seo: object({
    url: string().optional(),
    title: string().optional(),
    description: string().optional(),
    keywords: array(string()).optional()
  }),
  slugUrl: string()
    .min(3)
    .regex(/^[a-z0-9-]*$/, {
      message: 'Slug must only contain lowercase letters, numbers, and hyphens.'
    })
    .refine((slug: string) => !slug.includes(' '), {
      message: 'Slug must not contain spaces.'
    })
    .refine((slug: string) => !slug.includes('&'), {
      message: "Slug must not contain the '&' character."
    }),
  isActive: boolean(),
  type: string(),
  subCategories: array(string()).optional(),
  mainCategories: array(string()).optional(),
  translations: any(),
  showOnAppNavigation: boolean()
})

export const storeSettings = object({
  name: string(),
  description: string().optional(),
  parent: string().nullable().optional(),
  image: string().optional(),
  displayOrder: string().or(number()).optional(),
  seo: object({
    url: string().optional(),
    title: string().optional(),
    description: string().optional(),
    keywords: array(string()).optional()
  }),
  isActive: string(),
  type: string().optional(),
  subCategories: array(string()).optional(),
  mainCategory: array(string()).optional(),
  translations: any()
  // promotionImage: string().optional(),
  // isPromotion: string().optional(),
  // featuredLists: array(string()).optional()
})

const deliveryModeSchema = z
  .object({
    timeDurationType: z.string(),
    deliveryTime: z
      .number({ message: 'Required Standard Delivery Time' })
      .nonnegative(),
    priceRange: array(
      object({
        priceFrom: z
          .number({ message: 'Required expected delivery' })
          .nonnegative({ message: 'Must be a positive value' }),
        priceTo: z
          .number({ message: 'Required delivery charges' })
          .nonnegative()
          .optional(),
        noLimit: z.boolean(),
        deliveryCharge: z
          .number({
            message: 'Required Minimum Order Value for Free Delivery'
          })
          .nonnegative()
      })
    )
  })
  .optional()

export const deliveryPolicySchema = z
  .object({
    zoneName: z.string().min(1, { message: 'Required Zone name' }),
    description: z.string().min(1, { message: 'Required Zone description' }),
    postalCodeType: z.enum(['postalCode', 'postalCodeRange']),
    postalCodes: z.array(z.string()).optional(),
    postalCodeRanges: z
      .object({
        to: z.string().optional(),
        from: z.string().optional()
      })
      .optional(),
    deliverableStores: z
      .number()
      .min(1, { message: 'Policy must be deliverable at least 1 store' })
      .optional(),
    isStandardDeliveryAvailable: z.boolean(),
    isOneDayDeliveryAvailable: z.boolean(),
    deliveryModes: z.object({
      standard: deliveryModeSchema,
      oneDay: deliveryModeSchema
    })
  })
  .superRefine((data, ctx) => {
    // Validate postalCodes when postalCodeType is 'postalCode'
    if (
      data.postalCodeType === 'postalCode' &&
      (!data.postalCodes || data.postalCodes.length === 0)
    ) {
      ctx.addIssue({
        path: ['postalCodes'],
        code: z.ZodIssueCode.custom,
        message: 'Select at least 1 zip code'
      })
    }

    // Validate postalCodeRanges when postalCodeType is 'postalRange'
    if (
      data.postalCodeType === 'postalCodeRange' &&
      !data?.postalCodeRanges?.to
    ) {
      ctx.addIssue({
        path: ['postalCodeRanges.to'],
        code: z.ZodIssueCode.custom,
        message: 'Give valid to zip code'
      })
    }
    if (
      data.postalCodeType === 'postalCodeRange' &&
      data?.postalCodeRanges?.to &&
      data?.postalCodeRanges?.to?.length < 6
    ) {
      ctx.addIssue({
        path: ['postalCodeRanges.to'],
        code: z.ZodIssueCode.custom,
        message: 'Must be length of 6'
      })
    }

    if (
      data.postalCodeType === 'postalCodeRange' &&
      !data?.postalCodeRanges?.from
    ) {
      ctx.addIssue({
        path: ['postalCodeRanges.from'],
        code: z.ZodIssueCode.custom,
        message: 'Give valid from zip code'
      })
    }
    if (
      data.postalCodeType === 'postalCodeRange' &&
      data?.postalCodeRanges?.from &&
      data?.postalCodeRanges?.from?.length < 6
    ) {
      ctx.addIssue({
        path: ['postalCodeRanges.from'],
        code: z.ZodIssueCode.custom,
        message: 'Must be length of 6'
      })
    }

    if (
      data.postalCodeType === 'postalCodeRange' &&
      data?.postalCodeRanges?.from &&
      Number(data?.postalCodeRanges?.from) < 0
    ) {
      ctx.addIssue({
        path: ['postalCodeRanges.from'],
        code: z.ZodIssueCode.custom,
        message: 'Value must be positive'
      })
    }

    if (
      data.postalCodeType === 'postalCodeRange' &&
      data?.postalCodeRanges?.to &&
      Number(data?.postalCodeRanges?.to) < 0
    ) {
      ctx.addIssue({
        path: ['postalCodeRanges.to'],
        code: z.ZodIssueCode.custom,
        message: 'Value must be positive'
      })
    }
  })

export const keywordTranslationForm = object({
  keyword: string(),
  group: string()
})

export const translationFormSchema = object({
  keyword: string(),
  english: string(),
  translations: any()
})

export const zipCodeSchema = z.object({
  zipCode: z.string().min(1, { message: 'Zip Code is required' }),
  area: z.string().min(1, { message: 'Area is Required' }),
  district: z.string().min(1, { message: 'District is Required' }),
  state: z.string().min(1, { message: 'State is Required' }),
  location: z.object({
    type: z.string().default('Point'),
    coordinates: z.array(z.number()).min(2, 'Select coordinates')
  }),
  isDeliverable: z.boolean().default(true)
})

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(5, { message: 'Password should be at least 5 characters' }),
  confirmPassword: z
    .string()
    .min(5, { message: 'Password should be at least 5 characters' })
})

export const newUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.string(),
  extraAttr: z
    .object({
      doctorName: z.string().optional(),
      doctorWhatsappNumber: z.string().optional(),
      qualification: z.string().optional(),
      regNo: z.string().optional(),
      hospitalName: z.string().optional(),
      hospitalAddress: z.string().optional()
    })
    .optional()
})
export const editUserSchema = z.object({
  role: z.string()
})

export const rolesSchema = z.object({
  roleName: z.string().min(3, { message: 'Role name is required' }),
  fullAccess: boolean()
  // modules: z
  //   .array(
  //     z.object({
  //       moduleId: z.string(),
  //       permissions: z
  //         .array(z.string())
  //         .min(1, 'At least one permission is required')
  //     })
  //   )
  //   .min(1, 'At least one module is required')
})

export const formSchema = object({
  taxId: string()
})

export const storeSettingsSchema = object({
  lockStockWarning: string(),
  outOfStockWarning: string(),
  emailIds: array(string()),
  phoneNumbers: array(string()),
  lockStockWarningStatus: boolean(),
  outOfStockWarningStatus: boolean()
})
export const stockAdjustmentSchema = z
  .object({
    operation: z.string(),
    quantity: coerce
      .number({ required_error: 'Quantity is required' })
      .min(1, { message: 'Must be greater than 0' }),
    batchNo: z.string().min(1, { message: 'Batch no is required' }),
    newBatchNo: z.string().optional(),
    expiryDate: z
      .date() // Assuming the input is a string (ISO format like 'YYYY-MM-DD')
      .optional(),
    reason: z.string()
  })
  .superRefine((data, ctx) => {
    if (data.batchNo === '__new__') {
      if (!data.newBatchNo?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'New batch no is required',
          path: ['newBatchNo'] // Attach error to 'email' field
        })
      }

      const fieldDate = dayjs(data.expiryDate).endOf('day')
      const tomorrowDate = dayjs().startOf('day').add(1, 'day')

      if (!data.expiryDate)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiry date is required for new batch',
          path: ['expiryDate'] // Attach error to 'phone' field
        })
      else if (!fieldDate.isAfter(tomorrowDate))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiry date must be a future date',
          path: ['expiryDate'] // Attach error to 'phone' field
        })
    }
  })

export const addProductToInventorySchema = z.object({
  stock: coerce.number({ required_error: 'Stock is required' }).min(1),
  batchNo: z.string().refine(str => str.trim().length > 0, {
    message: 'Batch no is required'
  }),
  expiryDate: z
    .date() // Assuming the input is a string (ISO format like 'YYYY-MM-DD')
    .refine(
      date => {
        const fieldDate = dayjs(date).endOf('day')
        const tomorrowDate = dayjs().startOf('day').add(1, 'day')
        return fieldDate.isAfter(tomorrowDate)
      },
      {
        message: 'Date cannot be in the past' // Custom error message
      }
    )
})

export const sectionSchema = z.object({
  type: z.string().optional(),
  sectionName: string().min(5, {
    message: 'Section name must have atleast 5 letters'
  }),
  sectionType: z.string().optional(),
  categories: z.array(string()).optional(),
  products: z.array(string()).optional(),
  startDate: date().nullable().optional(),
  endDate: date().nullable().optional(),
  isActive: z.boolean(),
  position: z
    .string()
    .regex(/^\d+$/, { message: 'Position must be a positive integer' })
    .optional()
    .or(z.number().int().nonnegative()),
  images: z.array(any()).optional(),
  modifiedImages: z.array(any()).optional(),
  columnOnLayout: z
    .union([
      z.number().int().nonnegative(),
      z.string().regex(/^\d+$/, {
        message: 'Column layout must be a positive integer'
      })
    ])
    .optional()
})

export const sponsoredLayoutSchema = z
  .object({
    title: string().min(5, {
      message: 'Section name must have at least 5 letters'
    }),
    type: z.string().optional(),
    startDate: date().nullable().optional(),
    endDate: date().nullable().optional(),
    isActive: z.boolean(),
    translations: any(),
    properties: z.object({
      autoScroll: z.boolean().optional(),
      scrollTime: coerce.number().optional()
    })
  })
  .superRefine((data, ctx) => {
    // Check the conditions for maximumDiscountValue
    if (
      data?.properties?.autoScroll == true &&
      data?.properties?.scrollTime == 0
    ) {
      ctx.addIssue({
        path: ['scrollTime'],
        code: z.ZodIssueCode.custom,
        message: 'Scroll time should be greater than 0'
      })
    }
  })

export const sponsoredLayoutBannerSchema = z
  .object({
    title: string().min(5, {
      message: 'Section name must have at least 5 letters'
    }),
    type: z.string().optional(),
    startDate: date().nullable().optional(),
    endDate: date().nullable().optional(),
    isActive: z.boolean(),
    device: z.object({
      desktop: z.object({}, { message: 'Desktop image is required' }),
      tablet: z.any().optional(),
      mobile: z.object({}, { message: 'Mobile image is required' })
    }),
    sponsoredId: string().optional(),
    translations: any(),
    properties: z.object({
      redirectType: z.string(),
      collection: z.any().nullable().optional(),
      redirectUrl: z.string().optional()
    })
  })
  .superRefine((data, ctx) => {
    if (
      data?.properties?.redirectType == 'collection' &&
      !data?.properties?.collection
    ) {
      ctx.addIssue({
        path: ['properties.collection'],
        code: z.ZodIssueCode.custom,
        message: 'Collection is required'
      })
    }
    if (
      data?.properties?.redirectType == 'externalLink' &&
      data?.properties?.redirectUrl == ''
    ) {
      ctx.addIssue({
        path: ['properties.redirectUrl'],
        code: z.ZodIssueCode.custom,
        message: 'Redirect URL is required'
      })
    }
  })

export const sponsoredLayoutFeaturedSchema = z
  .object({
    title: string().min(5, {
      message: 'Section name must have at least 5 letters'
    }),
    type: z.string().optional(),
    collections: z.array(string()).optional(),
    products: z.array(string()).optional(),
    collection: z.string().nullable(),
    properties: z.object({ theme: z.string().optional() }).optional(),
    startDate: date().nullable().optional(),
    endDate: date().nullable().optional(),
    isActive: z.boolean(),
    translations: any()
  })
  .superRefine((data, ctx) => {
    // Check the conditions for maximumDiscountValue
    if (data.type == 'featured-products' && data?.products?.length == 0) {
      ctx.addIssue({
        path: ['products'],
        code: z.ZodIssueCode.custom,
        message: 'Minimum 1 product should be selected'
      })
    }

    if (data.type == 'featured-categories' && data?.collections?.length == 0) {
      ctx.addIssue({
        path: ['collections'],
        code: z.ZodIssueCode.custom,
        message: 'Minimum 1 collection should be selected'
      })
    }
  })

export const sponsoredLayoutCommonSchema = z
  .object({
    title: string().min(5, {
      message: 'Section name must have at least 5 letters'
    }),
    type: z.string().optional(),
    properties: z.object({
      videoUrl: z.string().optional()
    }),
    startDate: date().nullable().optional(),
    endDate: date().nullable().optional(),
    isActive: z.boolean(),
    translations: any()
  })
  .superRefine((data, ctx) => {
    if (data.type == 'generic-medicine-info' && !data?.properties.videoUrl) {
      ctx.addIssue({
        path: ['videoUrl'],
        code: z.ZodIssueCode.custom,
        message: 'videoUrl is required'
      })
    }
  })

export const collectionsSchema = z.object({
  name: z.string().min(3, { message: 'name must be atleast 3 characters' }),
  url: z.string().min(3, { message: 'url must be atleast 3 characters' }),
  description: z.string().optional(),
  slug_url: z
    .string()
    .min(3, { message: 'slug url must be atleast 3 characters' })
})

export const navigationSchema = z.object({
  collection: z.string(),
  level: z.number().optional(),
  parentMenu: z.string().nullable().optional()
})

export const collectionSchema = object({
  name: string({ required_error: 'Category name is required' })
    .min(3)
    .max(36, { message: '36 characters are allowed for category name!' })
    .regex(/^[A-Za-z\s&]+$/, {
      message: 'Category name can only contain alphabets and &'
    }),
  description: string()
    .max(180, {
      message: '180 characters are allowed for category description!'
    })
    .optional(),
  image: string().optional(),
  modifiedImage: any(),
  slugUrl: string()
    .min(3)
    .regex(/^[a-z0-9-]*$/, {
      message: 'Slug must only contain lowercase letters, numbers, and hyphens.'
    })
    .refine((slug: string) => !slug.includes(' '), {
      message: 'Slug must not contain spaces.'
    })
    .refine((slug: string) => !slug.includes('&'), {
      message: "Slug must not contain the '&' character."
    }),
  isActive: boolean(),
  translations: any()
})

export const consultationSchema = z.object({
  vitals: z.object({
    height: z.number(),
    weight: z.number(),
    bloodPressure: z.union([z.string(), z.number()]),
    temperature: z.number()
  }),
  chiefComplains: z.array(
    z.object({
      concern: z.string().min(1, { message: 'Concern is required' }),
      duration: z.string().min(1, { message: 'Duration is required' }),
      severity: z.string().min(1, { message: 'Severity is required' })
    })
  ),
  provisionalDiagnosis: z.array(
    z.object({
      concern: z.string().min(1, { message: 'Concern is required' }),
      duration: z.string().min(1, { message: 'Duration is required' }),
      severity: z.string().min(1, { message: 'Severity is required' })
    })
  ),
  medicines: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1, { message: 'minimum quantity must be 1' }),
        note: z.string(),
        product: z.any(),
        dosage: z.object({
          timesPerDay: z.number(),
          noOfDays: z.number(),
          beforeFood: z.boolean(),
          afterFood: z.boolean(),
          morning: z.boolean(),
          afternoon: z.boolean(),
          night: z.boolean(),
          sos: z.boolean()
        })
      })
    )
    .min(1, { message: 'Please add at least 1 medicine' }),
  note: z.string().optional(),
  prescriptionExpiryDate: z.date()
})

export const courierSchema = z.object({
  deliveryMode: z.string(),
  mode: z.string(),
  search: z.string(),
  logisticPartner: z.string(),
  packageSize: z.string(),
  onlyLocal: z.boolean(),
  QcCheck: z.boolean(),
  courierPartners: z.array(z.string()),
  sourcePostalCode: z.string().length(6, { message: 'Must be 6 digit long' }),
  destinationPostalCode: z
    .string()
    .length(6, { message: 'Must be 6 digit long' })
})

export const storeSchema = z.object({
  storeName: z.string({ message: 'Store Name is required' }).min(1),
  gstNumber: z.string({ message: 'GST number is required' }).min(1),
  fssaiNumber: z
    .string({ message: 'FSSAI number is required' })
    .refine(
      value =>
        !value ||
        (value.length === 14 &&
          /^\d{14}$/.test(value) &&
          ['1', '2', '3'].includes(value[0])),
      {
        message:
          'FSSAI number must be exactly 14 digits, contain only digits, and start with 1, 2, or 3 if provided.'
      }
    ),
  // .refine(
  //   (fssaiNumber) => stateCodes.includes(fssaiNumber.substring(1, 3)),
  //   { message: "Invalid state code in FSSAI number." }
  // )
  // .refine(
  //   (fssaiNumber) => {
  //     const year = parseInt(fssaiNumber.substring(3, 5), 10);
  //     return year >= 10 && year <= currentYear;
  //   },
  //   { message: "Invalid year in FSSAI number." }
  // )
  licenceNumber: z.string({ message: 'License number is required' }).min(1),
  storeCode: z.string({ message: 'Store code is required' }).min(1),
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Must be in email format' })
    .trim()
    .min(1),
  phoneNumber: z
    .string({ message: 'Phone Number is required' })
    .min(10, { message: 'Phone number can have only 10 digits' })
    .max(10, { message: 'Phone number can have only 10 digits' }),
  city: z.string({ message: 'City is required' }).min(1),
  state: z.string({ message: 'State is required' }).min(1),
  pincode: z.string({ message: 'Pin code is required' }).min(1),
  address: z.string({ message: 'address is required' }).min(1),
  serviceableZip: z
    .array(z.any())
    .min(1, { message: 'Select at least 1 zip code' })
    .min(1),
  coordinates: z.object({
    longitude: z.number({ message: 'Longitude is required' }),
    latitude: z.number({ message: 'Longitude is required' })
  })
})

export const generalSettings = z.object({
  handlingChargeApplicable: z.boolean().default(false),
  handlingCharge: coerce
    .number({ required_error: 'Handling charge is required' })
    .gte(0)
    .default(0),
  packingChargeApplicable: z.boolean().default(false),
  packingCharge: coerce
    .number({ required_error: 'Packing charge is required' })
    .gte(0)
    .default(0),
  platformFeeApplicable: z.boolean().default(false),
  platformFee: coerce
    .number({ required_error: 'Platform fee is required' })
    .gte(0)
    .default(0)
})

export const pharmacistSchema = z.object({
  name: z.string().min(3, 'Pharmacist name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^\d+$/, 'Phone number must be digits only'),
  pin: z.string().min(1, 'Pin is required')
})

export const getModifyReturnSchema = (maxQuantity: number) =>
  z.object({
    quantity: z.coerce
      .number()
      .min(1, 'Quantity must be at least 1')
      .max(maxQuantity, `Quantity cannot exceed ${maxQuantity}`)
      .optional()
  })
