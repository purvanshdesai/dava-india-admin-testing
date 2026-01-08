'use client'
import React from 'react'
import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'
import PdfViewerComponent from '@/components/utils/PdfViewver'
import FormDialog from '@/components/form/FormDialogBox'

export const LogisticsInfo = ({ tracking }: any) => {
  return (
    <div className='py-9'>
      <div>
        <div className='pb-3 text-lg font-semibold'>Logistics Information</div>
        <div className='rounded-md border p-6'>
          <div className='mb-6 flex items-center justify-between text-xl font-semibold'>
            <div className={'mr-6 flex gap-3'}>
              <FormDialog
                footerNotReq={true}
                className='md:w-[1200px]'
                content={
                  <div className='h-full overflow-y-auto'>
                    <PdfViewerComponent
                      pdfUrl={tracking.labelUrl}
                      fileName={`label`}
                    />
                  </div>
                }
                trigger={
                  <Button
                    variant={'outline'}
                    className={'text-primary'}
                    disabled={!tracking.labelUrl}
                  >
                    Download Label
                  </Button>
                }
                title={'Document'}
                footerActions={() => <></>}
              />

              <FormDialog
                footerNotReq={true}
                className='md:w-[1200px]'
                content={
                  <div className='h-full overflow-y-auto'>
                    <PdfViewerComponent
                      pdfUrl={tracking.manifestUrl}
                      fileName={`manifest`}
                    />
                  </div>
                }
                trigger={
                  <Button
                    variant={'outline'}
                    className={'text-primary'}
                    disabled={!tracking.manifestUrl}
                  >
                    Download Manifest
                  </Button>
                }
                title={'Document'}
                footerActions={() => <></>}
              />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <p className='font-semibold'>Logistics Partner</p>
              <p className={'text-sm'}>Shiprocket</p>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold'>Courier Partner</p>
              <p className={'text-sm'}>{tracking.logisticPartnerCourierName}</p>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold'>AWB Number</p>
              <p className={'text-sm'}>{tracking.awbNo}</p>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold'>Pickup Time</p>
              <p className={'text-sm'}>
                {tracking.pickupScheduledAt
                  ? dayjs(tracking.pickupScheduledAt).format(
                      process.env.DATE_TIME_FORMAT
                    )
                  : '--'}
              </p>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold'>Tracking URI</p>
              <p className={'text-sm'}>--</p>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold'>Estimated Time of Delivery</p>
              <p className={'text-sm'}>
                {tracking.etd
                  ? dayjs(tracking.etd).format(process.env.DATE_TIME_FORMAT)
                  : '--'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
