import React from 'react'
import { getProductStatus } from './orderUtils'
import { Button } from '../ui/button'

export default function ProductDetailsComponent({
  storeTracking,
  isCancelOrReturn,
  onSelectTrack
}: any) {
  let items = storeTracking?.items ?? []
  if (!isCancelOrReturn)
    items = items?.filter(
      (p: any) => !p.isCancelRequested && !p.isReturnRequested
    )

  return (
    <div className='rounded-md border'>
      <div
        className={`item flex justify-between p-3 text-sm ${isCancelOrReturn ? 'bg-red-100' : 'bg-gray-200'}`}
      >
        <div>
          Store Name:{' '}
          <span className='font-semibold'>
            {storeTracking?.store?.storeName}
          </span>
        </div>
      </div>

      <div>
        <div className='grid grid-cols-[160px_1fr_2fr_1fr_1fr_80px] gap-4 border-b p-3 text-sm font-semibold'>
          <div></div>
          <div>Product Id</div>
          <div>Name</div>
          <div>Quantity</div>
          <div>Status</div>
          <div></div>
        </div>

        {!items.length && (
          <div className='grid grid-cols-[160px_1fr_2fr_1fr_1fr_80px] items-center justify-center gap-4 border-b p-3 text-sm'>
            <div className='col-span-6 text-center'>No Items</div>
          </div>
        )}

        {items?.map((orderItem: any, index: number) => {
          if (!isCancelOrReturn && orderItem?.isCancelRequested) return <></>
          return (
            <div
              className='grid grid-cols-[160px_1fr_2fr_1fr_1fr_80px] items-center gap-4 border-b p-3 text-sm'
              key={index}
            >
              <div className={'flex items-center justify-center'}>
                <img
                  src={orderItem?.product?.images?.[0]?.objectUrl}
                  alt=''
                  className='h-[80px] w-[80px] rounded-lg object-contain'
                />
              </div>
              <div>
                <p>{orderItem?.product?.sku}</p>
              </div>
              <div>
                <p className='line-clamp-2'>{orderItem?.product?.title}</p>
              </div>
              <div>
                <p>{orderItem?.quantity}</p>
              </div>
              <div className='capitalize'>
                {getProductStatus(orderItem, storeTracking?.lastTimelineStatus)}
              </div>
              <div>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  className='text-primary'
                  onClick={() => {
                    onSelectTrack({ storeTracking, orderItem })
                  }}
                >
                  Track
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
