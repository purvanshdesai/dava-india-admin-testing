'use client'

import { Button } from '@/components/ui/button'
import { Info, SquarePlus } from 'lucide-react'
import { DataTable } from '@/components/ui/DataTable/data-table'
import { StockAdjustmentColumns } from '@/components/inventory/InventoryDetails/StockAdjustmentColumns'
import React, { useEffect, useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
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
import {
  useFetchProductStockEntries,
  useUpdateInventory
} from '@/utils/hooks/inventoryHooks'
import dayjs from 'dayjs'
import { DialogClose } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import FormReactDatePicker from '@/components/form/FormReactDatePicker'

export default function StockAdjustment({ inventoryDetails }: any) {
  const queryClient = useQueryClient()
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [tableData, setTableData] = useState<any[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data, isPending, isSuccess } = useFetchProductStockEntries({
    storeId: inventoryDetails.storeId._id,
    productId: inventoryDetails.productId._id,
    limit: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize
  })

  const minStockThreshold = 10
  const currentStock = inventoryDetails.stock

  const addStockEntry = (entry: any) => {
    const transformedData = {
      _id: entry._id,
      date: dayjs(entry.createdAt).format(process.env.DATE_FORMAT),
      prevStockQty: entry.updatedStock - entry.quantity,
      adjustedStockQty: entry.updatedStock,
      reason: entry.reason,
      uploadedBy: entry.createdBy.fullName
    }
    const newTableData = [
      transformedData,
      ...(tableData.length > pagination.pageSize
        ? tableData.slice(0, pagination.pageSize - 1)
        : tableData)
    ]
    setTableData(newTableData)
    queryClient.invalidateQueries({ queryKey: ['fetch-inventory-by-id'] })
  }

  useEffect(() => {
    if (isSuccess) {
      const transformedData = data.data.map((d: any) => {
        return {
          _id: d._id,
          date: dayjs(d.createdAt).format(process.env.DATE_FORMAT),
          prevStockQty: d.updatedStock - d.quantity,
          adjustedStockQty: d.updatedStock,
          reason: d.reason,
          uploadedBy: d.createdBy?.fullName
        }
      })
      setTableData(transformedData)
    }
  }, [isSuccess])

  return (
    <div>
      <div className={'flex items-center justify-between py-4'}>
        <div
          className={`text-lg font-semibold ${currentStock > minStockThreshold ? 'flex-grow' : ''}`}
        >
          Available Stock: {currentStock}
        </div>
        {currentStock < minStockThreshold && (
          <div
            className={'flex flex-grow items-center pl-5 text-sm text-red-600'}
          >
            <Info height={18} className={'mx-1'} />
            Stock quantity is below the warning number
          </div>
        )}
        <div>
          <AdjustStockModal
            inventoryDetails={inventoryDetails}
            addStockEntry={addStockEntry}
          />
        </div>
      </div>

      <div className='py-2'>
        <DataTable
          dataState={[tableData, setTableData]}
          totalRows={data?.total ?? 0}
          isLoading={isPending}
          pagination={pagination}
          setPagination={setPagination}
          columns={StockAdjustmentColumns}
          page='category'
          setColumnFilters={setColumnFilters}
          columnFilters={columnFilters}
          filters={null}
        />
      </div>
    </div>
  )
}

const AdjustStockModal = ({ inventoryDetails, addStockEntry }: any) => {
  const { mutate: updateInventory, data, isSuccess } = useUpdateInventory()

  const [showDialog, setShowDialog] = useState<boolean>(false)
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

    updateInventory({ ...formValues, _id: inventoryDetails._id })
    setShowDialog(false)
  }

  useEffect(() => {
    if (isSuccess) {
      form.reset()
      addStockEntry(data)
    }
  }, [isSuccess])

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
                <div className={'font-medium'}>Store Name</div>
                <div>
                  <Input
                    readOnly={true}
                    disabled={true}
                    value={inventoryDetails.storeId.storeName}
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
                    value={inventoryDetails.stock}
                    className={'border-gray-400 bg-gray-200'}
                  />
                </div>
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
                            }} // Properly bind react-hook-form's state change
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
                            }} // Properly bind react-hook-form's state change
                          >
                            <SelectTrigger className='w-[180px]'>
                              <SelectValue placeholder='Select Batch No' />
                            </SelectTrigger>
                            <SelectContent>
                              {form.watch('operation') === 'add' && (
                                <SelectItem value='__new__'>Add New</SelectItem>
                              )}
                              {(inventoryDetails.batches ?? []).map(
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
            onClick={() => {
              form.handleSubmit(handleSubmit)()
            }}
          >
            Save
          </Button>
        </div>
      )}
      trigger={
        <Button variant={'default'} className={'rounded-lg'}>
          <SquarePlus height={18} className={'mx-2'} /> Adjust Stock
        </Button>
      }
      title={'Adjust Stock'}
    />
  )
}
