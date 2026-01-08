import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string()
})

export type Task = z.infer<typeof taskSchema>

export const storeSchema = z.object({
  _id: z.string(),
  storeName: z.string(),
  gstNumber: z.string(),
  licenceNumber: z.string(),
  email: z.string(),
  city: z.string(),
  state: z.string(),
  active: z.boolean().optional()
})

export const categorySchema = z.object({
  _id: z.string(), // Assuming ObjectIdSchema returns a string
  name: z.string(),
  parent: z.any(), // If the reference might be null or undefined
  description: z.string(),
  image: z.string(),
  displayOrder: z.number(),
  seo: z.any(),
  isActive: z.enum(['active', 'inactive'])
})

export type Category = z.infer<typeof categorySchema>

export type Store = z.infer<typeof storeSchema>

export const productsSchema = z.object({
  _id: z.string(),
  productId: z.any(),
  productName: z.any(),
  variationId: z.any()
})
export type Products = z.infer<typeof productsSchema>

export const couponsSchema = z.object({
  _id: z.string(), // Assuming ObjectIdSchema returns a string
  couponName: z.string(),
  discountType: z.string(),
  couponCode: z.string(),
  usageLimit: z.any(),
  discountValue: z.number(),
  startDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  active: z.boolean()
})

export type Coupons = z.infer<typeof couponsSchema>

export const rolesSchema = z.object({
  _id: z.string(),
  roleName: z.string(),
  modules: z.any(),
  fullAccess: z.boolean()
})

export type Roles = z.infer<typeof rolesSchema>

export const sponsorSchema = z.object({
  _id: z.string(),
  sectionName: z.string(),
  type: z.string(),
  sectionType: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isActive: z.boolean()
})

export type Sponsor = z.infer<typeof sponsorSchema>

export const collectionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slugUrl: z.string()
})

export type Collections = z.infer<typeof collectionSchema>

export const ticketsTableSchema = z.object({
  _id: z.string(),
  createdAt: z.any(),
  dueDate: z.any(),
  orderNo: z.any(),
  orderDate: z.any(),
  raisedBy: z.any(),
  status: z.any(),
  assignee: z.any()
})
export type TicketsTable = z.infer<typeof ticketsTableSchema>

export const consumerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string()
})

export const requestMedicineSchema = z.object({
  _id: z.string(),
  name:z.string().optional(), 
  phoneNumber: z.string().optional(), 
  medicineName: z.string(), 
  quantity: z.number().optional(),
})
