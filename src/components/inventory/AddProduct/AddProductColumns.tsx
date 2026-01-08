'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Store } from '@/components/ui/DataTable/data/schema'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAddProductToInventory } from '@/utils/hooks/inventoryHooks'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { addProductToInventorySchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import FormDialog from '@/components/form/FormDialogBox'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import FormInputField from '@/components/form/FormInputField'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'
import { DialogClose } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import FormReactDatePicker from '@/components/form/FormReactDatePicker'

export const AddProductColumns: ColumnDef<Store>[] = [
  {
    accessorKey: 'product',
    header: () => <div></div>,
    cell: ({ row, table }: any) => {
      const product: any = row.getValue('product')
      const dataState = table?.options?.meta.dataState

      const setProductAsAdded = (productId: string) => {
        const [tableData, setTableData] = dataState
        const updatedProduct = tableData.find((d: any) => d._id === productId)
        if (!updatedProduct) return

        const prod = {
          ...updatedProduct,
          product: {
            ...updatedProduct.product,
            isAdded: true
          }
        }
        const updatedTableData = tableData.map((d: any) => {
          if (d._id === productId) {
            return prod
          }
          return d
        })
        setTableData(updatedTableData)
      }

      return (
        <div className='border-rounded flex w-full items-center gap-4 border-gray-400 p-2'>
          <div>
            <Image
              src={product.images?.[0]?.objectUrl}
              alt={'Product'}
              height={'50'}
              width={'50'}
              style={{ maxWidth: 'none', objectFit: 'contain' }}
            />
          </div>
          <div className={'flex flex-grow flex-col gap-1'}>
            <div className='text-sm font-semibold'>{product.title}</div>
            <div className={'text-xs text-label'}>{product.description}</div>
            <div className={'text-xs'}>{product.featuredListId?.name}</div>
          </div>
          <div>
            <AddProductModal
              product={{ ...product }}
              setProductAsAdded={setProductAsAdded}
            />
          </div>
        </div>
      )
    }
  }
]

const AddProductModal = ({ product, setProductAsAdded }: any) => {
  const { toast } = useToast()

  const [showDialog, setShowDialog] = useState<boolean>(false)

  const inventoryDetails = {
    storeId: {
      _id: '6713b6c17e4e5e561d780e04',
      storeName: 'Store 1'
    },
    stock: 50 // Example stock value to avoid any undefined references
  }
  const { data: sessionData } = useSession() as any

  const { mutate: addProductToInventory, isSuccess } =
    useAddProductToInventory()

  const form = useForm<z.infer<typeof addProductToInventorySchema>>({
    resolver: zodResolver(addProductToInventorySchema),
    defaultValues: {
      stock: 0,
      batchNo: '',
      expiryDate: dayjs().add(1, 'month').endOf('day').toDate()
    }
  })

  const formInstance = form as unknown as UseFormReturn

  const handleSubmit = (
    values: z.infer<typeof addProductToInventorySchema>
  ) => {
    const inventoryData = {
      ...values,
      storeId: inventoryDetails.storeId._id,
      productId: product._id
    }
    addProductToInventory({
      ...inventoryData,
      expiryDate: inventoryData.expiryDate.toISOString()
    })
    setShowDialog(false)
  }

  useEffect(() => {
    if (isSuccess) {
      setProductAsAdded(product._id)
      form.reset()
      toast({ title: 'Success', description: 'Product added to inventory' })
    }
  }, [isSuccess])

  return (
    <FormDialog
      isOpen={showDialog}
      onOpenChange={(show: boolean) => {
        form.reset()
        setShowDialog(show)
      }}
      title='Add Product Inventory'
      className={'min-w-[600px]'}
      footerNotReq={true}
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-8'
          >
            <div className='h-[70vh] overflow-y-auto px-3'>
              <div>
                <div className={'flex gap-2'}>
                  <div>
                    <Image
                      src={product.images?.[0]?.objectUrl}
                      alt={'Product'}
                      height={100}
                      width={100}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className={'flex flex-col gap-2 text-sm'}>
                    <div className='text-lg font-semibold'>{product.title}</div>
                    <div className='text-xs text-label'>
                      {product.description}
                    </div>
                  </div>
                </div>
              </div>

              <hr
                className='my-6 h-px border-0'
                style={{ backgroundColor: '#E3E8F0' }}
              />

              <div className={'m-auto grid grid-cols-2 gap-6'}>
                <div className={'flex flex-col gap-2 text-sm'}>
                  <div className={'font-semibold'}>Date</div>
                  <div>
                    <Input
                      readOnly={true}
                      disabled={true}
                      value={dayjs().format(process.env.DATE_FORMAT)}
                      className={'border-gray-400 bg-gray-200'}
                    />
                  </div>
                </div>

                <div className={'flex flex-col gap-2 text-sm'}>
                  <div className={'font-semibold'}>Store Name</div>
                  <div>
                    <Input
                      readOnly={true}
                      disabled={true}
                      value={sessionData.user.stores[0].storeName}
                      className={'border-gray-400 bg-gray-200'}
                    />
                  </div>
                </div>

                <div className={'flex flex-col gap-2 text-sm'}>
                  <div className={'font-semibold'}>Batch No</div>
                  <FormInputField
                    formInstance={formInstance}
                    name={'batchNo'}
                  />
                </div>

                <div className={'flex flex-col gap-2 text-sm'}>
                  <div className={'font-semibold'}>Expiry Date</div>
                  <FormReactDatePicker
                    formInstance={formInstance}
                    name='expiryDate'
                    placeholder='Select expiry date'
                    isSmall={true}
                  />
                </div>

                <div className={'flex flex-col gap-2 text-sm'}>
                  <div className={'font-semibold'}>Quantity Available</div>
                  <FormInputField
                    formInstance={formInstance}
                    name={'stock'}
                    type={'number'}
                    min={'1'}
                  />
                </div>
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
        <Button
          variant={'default'}
          className={'w-32 rounded-lg'}
          disabled={product.isAdded}
        >
          {product.isAdded ? 'Added' : 'Add'}
        </Button>
      }
    />
  )
}
