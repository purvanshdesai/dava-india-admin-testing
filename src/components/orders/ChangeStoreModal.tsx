import React, { useRef, useState } from 'react'
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { useGetStoreTransferReasons } from '@/utils/hooks/orderHooks'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import Image from 'next/image'

type TProps = {
  onChangeStore: (
    selectedStore: string,
    cancelReason: any,
    comment: any,
    transferType: string,
    selectedProducts?: any[]
  ) => void
  stores: any[]
  order?: any
}

export default function ChangeStoreModal({
  onChangeStore,
  stores,
  order
}: TProps) {
  const { data: storeTransferReasons, isPending } = useGetStoreTransferReasons()

  const [selectedStore, setSelectedStore] = useState('')
  const [storeSearch, setStoreSearch] = useState<string>('')
  const [selectStoreError, setSelectStoreError] = useState('')
  const [cancelReasonError, setCancelReasonError] = useState('')
  const [cancelReason, setCancelReason] = useState('stockUnavailability')
  const closeRef = useRef<any>(null)
  const [comment, setComment] = useState('')
  const [transferType, setTransferType] = useState('full')
  const [productQuantities, setProductQuantities] = useState<{
    [key: string]: number
  }>({})

  // Get all products from the order
  const getAllOrderProducts = () => {
    const products: any[] = []

    order?.orderItemTracking?.forEach((tracking: any) => {
      tracking?.items?.forEach((item: any) => {
        products.push({
          ...item,
          // keep if you want the parent store on each item; remove if not needed
          storeId: tracking?.store?._id,
          storeName: tracking?.store?.storeName
        })
      })
    })

    return products
  }

  const handleQuantityChange = (
    productId: string,
    quantity: number,
    maxQuantity: number
  ) => {
    const validQuantity = Math.max(0, Math.min(quantity, maxQuantity))
    setProductQuantities(prev => ({
      ...prev,
      [productId]: validQuantity
    }))
  }

  const getSelectedProducts = () => {
    const allProducts = getAllOrderProducts()
    return allProducts
      .filter(product => {
        const quantity = productQuantities[product?.product?._id] || 0
        return quantity > 0
      })
      .map(product => ({
        ...product,
        transferQuantity: productQuantities[product?.product?._id] || 0
      }))
  }

  const handleChangeStore = async () => {
    try {
      if (!selectedStore) {
        setSelectStoreError('Select at least one store')
        return
      }
      if (!cancelReason) {
        setCancelReasonError('Cancel reason required')
        return
      }
      if (transferType === 'partial') {
        const selectedProducts = getSelectedProducts()
        if (selectedProducts.length === 0) {
          setSelectStoreError(
            'Set quantity for at least one product for partial transfer'
          )
          return
        }
      }

      closeRef?.current?.click()
      onChangeStore(
        selectedStore,
        cancelReason,
        comment,
        transferType,
        transferType === 'partial' ? getSelectedProducts() : undefined
      )
    } catch (error) {
      throw error
    }
  }

  let storesData = []
  if (storeSearch?.length) {
    const searchTerm = storeSearch.toLowerCase()
    storesData = stores?.filter((item: any) => {
      return (
        item?.storeName?.toLowerCase().includes(searchTerm) ||
        item?.city?.toLowerCase().includes(searchTerm) ||
        item?.pincode?.toString().toLowerCase().includes(searchTerm) ||
        item?.storeCode?.toLowerCase().includes(searchTerm)
      )
    })
  } else {
    storesData = stores
  }

  if (isPending) return <div>Loading...</div>

  const allProducts = getAllOrderProducts()
  const selectedProducts = getSelectedProducts()
  const totalItemsToTransfer = selectedProducts.reduce(
    (sum, p) => sum + p.transferQuantity,
    0
  )

  return (
    <DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto'>
      <DialogHeader>
        <DialogTitle>Transfer Order</DialogTitle>
      </DialogHeader>
      <div className='space-y-6'>
        {/* Transfer Type Selection */}
        <div>
          <Label className='mb-3 block text-base font-semibold'>
            Transfer Type
          </Label>
          <RadioGroup
            value={transferType}
            onValueChange={value => {
              setTransferType(value)
              if (value === 'full') {
                setProductQuantities({})
              }
            }}
            className='flex items-center space-x-6'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem id='full' value='full' />
              <label
                htmlFor='full'
                className='text-sm font-medium text-black dark:text-gray-300'
              >
                Full Order Transfer
              </label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem id='partial' value='partial' />
              <label
                htmlFor='partial'
                className='text-sm font-medium text-black dark:text-gray-300'
              >
                Partial Order Transfer
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Partial Transfer Product Selection */}
        {transferType === 'partial' && (
          <div className='rounded-lg border bg-gray-50 p-4'>
            <Label className='mb-3 block text-base font-semibold'>
              Set Transfer Quantity for Each Product
            </Label>
            <div className='max-h-60 space-y-3 overflow-y-auto'>
              {allProducts.map((product: any, index: number) => (
                <div
                  key={product?.product._id || index}
                  className='flex items-center gap-3 rounded-md border bg-white p-3'
                >
                  <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md'>
                    {product?.product?.thumbnail ? (
                      <Image
                        src={product?.product?.thumbnail}
                        alt={product?.product?.title}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-500'>
                        No Image
                      </div>
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='line-clamp-2 text-sm font-medium'>
                      {product?.product?.title}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {product?.storeName}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Available Qty: {product?.quantity}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Label className='text-xs font-medium'>Transfer Qty:</Label>
                    <Input
                      type='number'
                      min={0}
                      max={product?.quantity}
                      value={productQuantities[product?.product?._id] || 0}
                      onChange={e =>
                        handleQuantityChange(
                          product?.product?._id,
                          parseInt(e.target.value) || 0,
                          product?.quantity
                        )
                      }
                      className='h-8 w-20 text-xs'
                      placeholder='0'
                    />
                  </div>
                </div>
              ))}
            </div>
            {selectedProducts.length > 0 && (
              <div className='mt-3 rounded-md bg-blue-50 p-3'>
                <p className='text-sm font-medium text-blue-800'>
                  {selectedProducts.length} product(s) selected for transfer
                </p>
                <p className='mt-1 text-xs text-blue-600'>
                  Total items to transfer: {totalItemsToTransfer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Store Selection */}
        <div>
          <Label className='mb-3 block text-base font-semibold'>
            Select Target Store
          </Label>
          <Input
            placeholder='Search store by name, city, or pincode'
            value={storeSearch}
            onChange={e => setStoreSearch(e.target.value)}
            className='mb-3'
          />
          <div className='max-h-[300px] overflow-y-auto rounded-lg border'>
            {selectStoreError ? (
              <p className='p-3 text-red-500'>{selectStoreError}</p>
            ) : null}
            {storesData?.map((store: any, index: number) => (
              <div
                key={index}
                className='flex cursor-pointer items-center gap-3 border-b p-4 hover:bg-gray-50'
                onClick={() => setSelectedStore(store?._id)}
              >
                <Checkbox
                  checked={store?._id === selectedStore}
                  onCheckedChange={() => setSelectedStore(store?._id)}
                  className='bg-white'
                />
                <div className='flex-1'>
                  <div className='flex flex-wrap gap-4'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold'>Store Name:</span>
                      <span className='text-sm'>{store.storeName}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold'>City:</span>
                      <span className='text-sm'>{store.city}</span>
                    </div>
                    {store?.pinCode && (
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold'>Pin Code:</span>
                        <span className='text-sm'>{store.pinCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel Reason */}
        <div>
          <Label className='mb-3 block text-base font-semibold'>
            Transfer Reason
          </Label>
          <Select
            value={cancelReason}
            onValueChange={val => setCancelReason(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select transfer reason' />
            </SelectTrigger>
            <SelectContent>
              {storeTransferReasons.map((reason: any, index: number) => (
                <SelectItem key={index} value={reason.statusCode}>
                  {reason.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {cancelReasonError ? (
            <p className='mt-1 text-sm text-red-500'>{cancelReasonError}</p>
          ) : null}
        </div>

        {/* Note */}
        <div>
          <Label className='mb-3 block text-base font-semibold'>
            Note (Optional)
          </Label>
          <Input
            placeholder='Add any additional notes...'
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <div className='flex justify-center pt-4'>
          <Button onClick={handleChangeStore} className='px-8'>
            {transferType === 'full'
              ? 'Transfer Full Order'
              : 'Transfer Partial'}
          </Button>
        </div>
        <DialogClose asChild>
          <div ref={closeRef}></div>
        </DialogClose>
      </div>
    </DialogContent>
  )
}
