import * as React from 'react'
import { useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { useAdminCancelOrderItem } from '@/utils/hooks/orderHooks'

type Product = {
  _id: string
  title: string
  thumbnail?: string | null
  sku?: string | number
}

export type OrderItem = {
  _id: string // line-item id
  product: Product
  quantity: number // ordered qty for this line
}

type LineInput = {
  orderItemId: string
  productId: string
  orderedQty: number
  selected: boolean
  cancelQty: number // coerced to number
}

// validation for each line
const LinesSchema = z
  .array(
    z.object({
      orderItemId: z.string(),
      productId: z.string(),
      orderedQty: z.number().int().nonnegative(),
      selected: z.boolean(),
      cancelQty: z.coerce.number({
        invalid_type_error: 'Enter a number'
      })
    })
  )
  .superRefine((lines, ctx) => {
    lines.forEach((l, idx) => {
      if (l.selected) {
        if (!Number.isInteger(l.cancelQty)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Quantity must be a whole number',
            path: [idx, 'cancelQty']
          })
        }
        if (l.cancelQty <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter at least 1 to cancel',
            path: [idx, 'cancelQty']
          })
        }
        if (l.cancelQty > l.orderedQty) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Cannot exceed ordered (${l.orderedQty})`,
            path: [idx, 'cancelQty']
          })
        }
      }
    })

    const anyValid = lines.some(
      l => l.selected && Number.isFinite(l.cancelQty) && l.cancelQty > 0
    )
    if (!anyValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one product and enter a cancel quantity.',
        path: ['_form']
      })
    }
  })

// main form schema
const FormSchema = z.object({
  lines: LinesSchema,
  reasonCode: z.string(),
  notes: z
    .string()
    .max(300, 'Notes must be 300 characters or fewer')
    .optional()
    .or(z.literal(''))
})

export type PartialCancelPayload = {
  orderItemId: string
  productId: string
  cancelQuantity: number
}

export interface CancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: OrderItem[]
  isSubmitting?: boolean
  onConfirm: () => void | Promise<void>
  order: any
  tracking: any
}

// predefined reasons
const reasons = [
  {
    _id: { $oid: '678fa7dee74de116da8d457c' },
    type: 'item-cancel-reason',
    statusCode: 'ordered-by-mistake',
    name: 'Ordered by mistake/Incorrect item'
  },
  {
    _id: { $oid: '678fa7dee74de116da8d457d' },
    type: 'item-cancel-reason',
    statusCode: 'found-better-alternative',
    name: 'Found a Better Price or Alternative'
  },
  {
    _id: { $oid: '678fa7dee74de116da8d457e' },
    type: 'item-cancel-reason',
    statusCode: 'other',
    name: 'Other'
  }
]

export function CancelItemModal({
  open,
  onOpenChange,
  items,
  onConfirm,
  order,
  tracking
}: CancelDialogProps) {
  const { mutateAsync: handleCancelOrderItem, isPending: isSubmitting } =
    useAdminCancelOrderItem()

  const defaultValues = useMemo(
    () => ({
      lines: items?.map<LineInput>(i => ({
        orderItemId: i._id,
        productId: i.product._id,
        orderedQty: i.quantity,
        selected: false,
        cancelQty: 0
      })),
      reasonCode: 'ordered-by-mistake',
      notes: ''
    }),
    [items]
  )

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState,
    getValues
  } = form
  const { fields } = useFieldArray({ control, name: 'lines' })

  const lines = watch('lines')
  const confirmDisabled =
    !formState.isValid ||
    !lines.some(
      l => l.selected && Number.isFinite(l.cancelQty) && l.cancelQty > 0
    )

  function clamp(n: number, min: number, max: number) {
    if (!Number.isFinite(n)) return min
    return Math.min(Math.max(n, min), max)
  }

  function onCancelInputBlur(index: number) {
    const l = getValues(`lines.${index}`)
    const clamped = clamp(Number(l.cancelQty), 0, l.orderedQty)
    setValue(`lines.${index}.cancelQty`, Math.trunc(clamped), {
      shouldValidate: true
    })
  }

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    const lines = values.lines
      .filter(l => l.selected && l.cancelQty > 0)
      .map<PartialCancelPayload>(l => ({
        orderItemId: l.orderItemId,
        productId: l.productId,
        cancelQuantity: l.cancelQty
      }))

    try {
      const data = {
        items: lines,
        reasonCode: values.reasonCode || '',
        notes: values.notes || '',
        orderId: order?._id,
        productTrackingId: tracking?._id
      }
      console.log('Cancel submit:', data)

      await handleCancelOrderItem(data)

      onConfirm()
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        onOpenChange(o)
        if (!o) reset(defaultValues)
      }}
    >
      <DialogContent className='max-w-4xl p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>Cancel items from this order</DialogTitle>
          <DialogDescription>
            Select products and enter the quantity to cancel. You can’t exceed
            the ordered quantity.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-4 px-6 pb-6'
          >
            {/* Bulk actions */}
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  lines.forEach((line, i) => {
                    const ordered = line?.orderedQty ?? 0
                    setValue(`lines.${i}.selected`, true, {
                      shouldValidate: true
                    })
                    setValue(`lines.${i}.cancelQty`, ordered, {
                      shouldValidate: true
                    })
                  })
                }}
              >
                Select all
              </Button>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  lines.forEach((_, i) => {
                    setValue(`lines.${i}.selected`, false, {
                      shouldValidate: true
                    })
                    setValue(`lines.${i}.cancelQty`, 0, {
                      shouldValidate: true
                    })
                  })
                }}
              >
                Clear
              </Button>
            </div>

            <Separator />

            {/* Line items */}
            <ScrollArea className='max-h-[40vh] overflow-y-auto pr-4'>
              <div className='space-y-4'>
                {fields.map((field, index) => {
                  const line = lines[index]
                  const ordered = line?.orderedQty ?? 0
                  const product = items[index]?.product
                  const remaining = Number.isFinite(line?.cancelQty)
                    ? ordered - (line?.cancelQty || 0)
                    : ordered

                  return (
                    <div
                      key={field.id}
                      className='flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center'
                    >
                      {/* Select checkbox */}
                      <FormField
                        control={control}
                        name={`lines.${index}.selected`}
                        render={({ field }) => (
                          <FormItem className='flex min-w-[24px] items-start gap-2'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={v => {
                                  const checked = Boolean(v)
                                  field.onChange(checked)
                                  if (!checked) {
                                    setValue(`lines.${index}.cancelQty`, 0, {
                                      shouldValidate: true
                                    })
                                  } else {
                                    // when checked, auto set full qty
                                    setValue(
                                      `lines.${index}.cancelQty`,
                                      ordered,
                                      {
                                        shouldValidate: true
                                      }
                                    )
                                  }
                                }}
                                aria-label={`Select ${product?.title ?? 'product'}`}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Product info */}
                      <div className='flex items-center gap-3 sm:flex-1'>
                        <div className='bg-muted h-14 w-14 shrink-0 overflow-hidden rounded border'>
                          {product?.thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className='h-full w-full object-cover'
                              loading='lazy'
                            />
                          )}
                        </div>
                        <div className='min-w-0'>
                          <div className='truncate font-medium'>
                            {product?.title}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Ordered:{' '}
                            <span className='font-medium'>{ordered}</span>
                            {product?.sku && (
                              <span className='ml-2'>SKU: {product.sku}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity input */}
                      <div className='sm:w-48'>
                        <FormField
                          control={control}
                          name={`lines.${index}.cancelQty`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cancel qty</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  inputMode='numeric'
                                  min={0}
                                  step={1}
                                  max={ordered}
                                  disabled={!lines[index]?.selected}
                                  value={field.value ?? ''}
                                  onChange={e => field.onChange(e.target.value)}
                                  onBlur={() => onCancelInputBlur(index)}
                                  placeholder='0'
                                />
                              </FormControl>
                              <div className='text-muted-foreground flex justify-between text-xs'>
                                <span>Max: {ordered}</span>
                                <span>Remaining: {Math.max(0, remaining)}</span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Reason select */}
            <FormField
              control={control}
              name='reasonCode'
              render={() => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Select
                      value={form.getValues('reasonCode')}
                      onValueChange={newCode =>
                        form.setValue('reasonCode', newCode)
                      }
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a reason' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {reasons.map(r => (
                            <SelectItem value={r.statusCode} key={r.statusCode}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes textarea */}
            <FormField
              control={control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Add any additional notes...'
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form-level error */}
            {'_form' in formState.errors && (
              <p className='text-destructive text-sm'>
                {(formState.errors as any)._form?.message}
              </p>
            )}

            {/* Footer */}
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  onOpenChange(false)
                  reset(defaultValues)
                }}
              >
                Close
              </Button>
              <Button type='submit' disabled={confirmDisabled || isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Confirm cancellation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
