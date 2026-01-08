'use client'

import { Button } from '@/components/ui/button'
import { SquarePlus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import FormDialog from '@/components/form/FormDialogBox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useForm, UseFormReturn } from 'react-hook-form'
import { stockAdjustmentSchema } from '@/lib/zod'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import FormInputField from '@/components/form/FormInputField'
import FormTextAreaField from '@/components/form/FormTextAreaField'
import { useUpdateInventory } from '@/utils/hooks/inventoryHooks'
import { useQuery } from '@tanstack/react-query'
import { fetchStoreInventory } from '@/utils/actions/inventoryActions'
import dayjs from 'dayjs'
import { DialogClose } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import FormReactDatePicker from '@/components/form/FormReactDatePicker'
import { useToast } from '@/hooks/use-toast'

interface StockAdjustmentDialogProps {
  product: any
  storeId: string
  inventoryId?: string
  onSuccess?: () => void
}

export default function StockAdjustmentDialog({
  product,
  storeId,
  inventoryId,
  onSuccess
}: StockAdjustmentDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { mutate: updateInventory, isSuccess } = useUpdateInventory()

  const [showDialog, setShowDialog] = useState<boolean>(false)

  // Try to fetch inventory data for this product in this store (only when dialog is open)
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    error: inventoryError
  } = useQuery({
    queryKey: ['stock-adjustment-inventory', storeId, product._id],
    queryFn: async () => {
      try {
        const result = await fetchStoreInventory({
          storeId: storeId,
          productId: product._id,
          limit: 1,
          skip: 0,
          filters: [] // Required by fetchStoreInventory function
        })

        return result
      } catch (error) {
        console.error('Error fetching inventory:', error)
        throw error
      }
    },
    enabled: showDialog && !!storeId && !!product._id,
    gcTime: 0,
    retry: 1
  })
  const [selectedBatchExpiryDate, setSelectedBatchExpiryDate] =
    useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<any>(null)

  const form = useForm<z.infer<typeof stockAdjustmentSchema>>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      operation: 'add',
      quantity: 0,
      batchNo: '',
      newBatchNo: '',
      expiryDate: dayjs().add(1, 'month').endOf('day').toDate(),
      reason: ''
    }
  })
  const formInstance = form as unknown as UseFormReturn

  const handleSubmit = (values: z.infer<typeof stockAdjustmentSchema>) => {
    const formValues = { ...values }
    if (formValues.batchNo === '__new__' && formValues.newBatchNo)
      formValues.batchNo = formValues.newBatchNo
    delete formValues.newBatchNo

    // Use the inventory ID from fetched data or provided inventoryId
    const targetInventoryId =
      inventoryDetails._id || inventoryId || product.inventory?._id
    if (!targetInventoryId) {
      toast({
        title: 'Error',
        description: 'Inventory record not found for this product',
        variant: 'destructive'
      })
      return
    }

    updateInventory({ ...formValues, _id: targetInventoryId })
    setShowDialog(false)
  }

  useEffect(() => {
    if (isSuccess) {
      form.reset()
      toast({
        title: 'Success',
        description: 'Stock adjusted successfully'
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['fetch-inventory-by-id'] })
      queryClient.invalidateQueries({ queryKey: ['get-store-admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['get-orders'] })

      if (onSuccess) {
        onSuccess()
      }
    }
  }, [isSuccess])

  // Get inventory details for this product
  const fetchedInventory = inventoryData?.data?.[0] // Get first inventory item from the list

  // Try multiple sources for inventory data, prioritizing product batches
  const inventoryDetails =
    fetchedInventory ||
    product.inventory ||
    (product.batches && product.batches.length > 0
      ? {
          _id:
            inventoryId ||
            product.inventory?._id ||
            `temp-${product._id}-${storeId}`,
          storeId: { _id: storeId },
          productId: { _id: product._id },
          stock: product.inventory?.stock || 0,
          batches: product.batches || []
        }
      : null)

  // Ensure we have batches from the product data even if inventory data doesn't have them
  if (inventoryDetails) {
    // Always prioritize product.batches if available
    if (product.batches && product.batches.length > 0) {
      inventoryDetails.batches = product.batches
    }
    // Fallback to empty array if no batches found
    if (!inventoryDetails.batches) {
      inventoryDetails.batches = []
    }
  }

  return (
    <FormDialog
      isOpen={showDialog}
      onOpenChange={(show: boolean) => {
        form.reset()
        setShowDialog(show)
      }}
      footerNotReq={true}
      className='min-w-[600px]'
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-8'
          >
            <div className='h-[70vh] overflow-y-auto px-3 text-sm'>
              {isInventoryLoading && (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-sm text-gray-500'>
                    Loading inventory data...
                  </div>
                </div>
              )}

              {inventoryError && (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-sm text-red-500'>
                    Error loading inventory:{' '}
                    {inventoryError.message || 'Unknown error'}
                  </div>
                </div>
              )}
              <div className={'mt-3 flex flex-col gap-2 text-sm'}>
                <div className={'font-medium'}>Date</div>
                <div>
                  <Input
                    readOnly={true}
                    disabled={true}
                    value={new Intl.DateTimeFormat('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }).format(new Date())}
                    className={'border-gray-400 bg-gray-200'}
                  />
                </div>
              </div>

              <div className={'mt-5 flex flex-col gap-2'}>
                <div className={'font-medium'}>Product Name</div>
                <div>
                  <Input
                    readOnly={true}
                    disabled={true}
                    value={product.title}
                    className={'border-gray-400 bg-gray-200'}
                  />
                </div>
              </div>

              <div className={'mt-5 flex flex-col gap-2'}>
                <div className={'font-medium'}>Product SKU</div>
                <div>
                  <Input
                    readOnly={true}
                    disabled={true}
                    value={product.sku}
                    className={'border-gray-400 bg-gray-200'}
                  />
                </div>
              </div>

              <div className={'mt-5 flex flex-col gap-2'}>
                <div className={'font-medium'}>Quantity Available</div>
                <div>
                  <Input
                    readOnly={true}
                    disabled={true}
                    value={inventoryDetails?.stock ?? 'Loading...'}
                    className={'border-gray-400 bg-gray-200'}
                  />
                </div>
                {!inventoryDetails && !isInventoryLoading && showDialog && (
                  <div className='text-xs text-red-500'>
                    No inventory data found for this product. Please ensure the
                    product is added to store inventory first.
                  </div>
                )}
              </div>

              <div className={'mt-5 flex flex-col gap-2'}>
                <div className={'flex justify-between'}>
                  <div className='flex-1'>
                    <div className={'py-2 font-medium'}>Operation</div>
                    <FormField
                      control={form?.control}
                      name='operation'
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={e => {
                              field.onChange(e)
                              if (e === 'remove') form.setValue('batchNo', '')
                            }}
                          >
                            <SelectTrigger className='w-[180px]'>
                              <SelectValue placeholder='Operation' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='add'>Add</SelectItem>
                              <SelectItem value='remove'>Remove</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='flex-1'>
                    <div className={'py-2 font-medium'}>Batch No</div>
                    <FormField
                      control={form?.control}
                      name='batchNo'
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={e => {
                              field.onChange(e)

                              const batch = inventoryDetails?.batches?.find(
                                (b: any) => b.batchNo === e
                              )
                              setSelectedBatchExpiryDate(batch?.expiryDate)
                              setSelectedBatch(batch)
                            }}
                          >
                            <SelectTrigger className='w-[180px]'>
                              <SelectValue placeholder='Select Batch No' />
                            </SelectTrigger>
                            <SelectContent>
                              {form.watch('operation') === 'add' && (
                                <SelectItem value='__new__'>Add New</SelectItem>
                              )}
                              {(inventoryDetails?.batches ?? []).map(
                                (b: any) => (
                                  <SelectItem key={b.batchNo} value={b.batchNo}>
                                    {b.batchNo}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          {form.watch('batchNo') &&
                            form.watch('batchNo') !== '__new__' && (
                              <span className={'p-2 text-sm text-label'}>
                                Expiry Date:{' '}
                                {dayjs(selectedBatchExpiryDate).format(
                                  process.env.DATE_FORMAT
                                )}
                              </span>
                            )}
                          {(!inventoryDetails?.batches ||
                            inventoryDetails.batches.length === 0) &&
                            showDialog && (
                              <div className='mt-1 text-xs text-gray-500'>
                                No batches available for this product
                              </div>
                            )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {form.watch('batchNo') === '__new__' && (
                <div className={'mt-5 flex flex-col gap-2'}>
                  <div className={'font-medium'}>New Batch No</div>
                  <FormInputField
                    formInstance={formInstance}
                    name={'newBatchNo'}
                  />
                </div>
              )}

              {form.watch('batchNo') === '__new__' && (
                <div className={'mt-5 flex flex-col gap-2'}>
                  <div className={'font-medium'}>Expiry Date</div>
                  <FormReactDatePicker
                    formInstance={formInstance}
                    name='expiryDate'
                    placeholder='Select expiry date'
                    isSmall={true}
                  />
                </div>
              )}

              <div className={'mt-5 flex flex-col gap-2'}>
                <div className={'font-medium'}>Quantity</div>
                <FormInputField
                  formInstance={formInstance}
                  name={'quantity'}
                  type={'number'}
                  min={0}
                />
              </div>

              <div className={'mt-5 flex flex-col gap-2'}>
                <div className={'font-medium'}>Updated Quantity</div>
                <div>
                  <Input
                    readOnly={true}
                    disabled={true}
                    value={
                      form.watch('operation') === 'add'
                        ? (selectedBatch?.stock ?? 0) +
                          Number(form.watch('quantity'))
                        : (selectedBatch?.stock ?? 0) -
                          Number(form.watch('quantity'))
                    }
                    className={'border-gray-400 bg-gray-200'}
                  />
                </div>
              </div>

              <div className={'my-5 flex flex-col gap-2'}>
                <div className={'font-medium'}>Reason for update</div>
                <FormTextAreaField
                  formInstance={formInstance}
                  name={'reason'}
                />
              </div>
            </div>
          </form>
        </Form>
      }
      footerActions={() => (
        <div className={'mt-5 flex justify-center gap-3'}>
          <DialogClose>
            <Button variant={'outline'} className={'w-32 text-primary'}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant={'default'}
            className={'w-32'}
            disabled={isInventoryLoading || !inventoryDetails}
            onClick={() => {
              form.handleSubmit(handleSubmit)()
            }}
          >
            Save
          </Button>
        </div>
      )}
      trigger={
        <Button
          variant={'outline'}
          size={'sm'}
          className={'text-primary'}
          disabled={!inventoryDetails && !inventoryId}
          title={
            !inventoryDetails && !inventoryId
              ? 'No inventory data available'
              : 'Adjust stock for this product'
          }
        >
          <SquarePlus height={16} className={'mr-1'} /> Adjust Stock
        </Button>
      }
      title={'Adjust Stock'}
    />
  )
}
