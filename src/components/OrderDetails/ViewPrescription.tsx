'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import Image from 'next/image'
import { X } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../ui/carousel'
import { useSession } from 'next-auth/react'
import { downloadFileFromURL } from '@/lib/utils'

export default function ViewPrescription({
  orderId = '',
  status,
  showActions = true,
  prescription = '',
  disableActionButtons,
  handlePrescriptionStatusChange
}: {
  orderId: string
  status: string
  showActions?: boolean
  prescription: string
  disableActionButtons?: boolean
  handlePrescriptionStatusChange: (status: 'accept' | 'reject') => void
}) {
  const { data: session }: any = useSession()
  const [pageHeight, setPageHeight] = useState(0)
  const userRole = session?.user?.role
  let prescriptionList = null

  if (Array.isArray(prescription)) {
    prescriptionList = prescription
  } else {
    prescriptionList = [prescription]
  }

  const handleReject = () => {
    if (userRole !== 'super-admin') return
    try {
      handlePrescriptionStatusChange('reject')
    } catch (error) {
      throw error
    }
  }
  const handleAccept = async () => {
    try {
      handlePrescriptionStatusChange('accept')
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    const height = window.innerHeight
    setPageHeight(height - 200)
  }, [])

  return (
    <DialogContent className='sm:max-w-[800px]'>
      <DialogHeader>
        <div className='flex items-center justify-between'>
          <DialogTitle>Prescription of order {orderId}</DialogTitle>

          <div className='flex items-center gap-3'>
            {status == 'paid' && (
              <div className='flex justify-center gap-4 pt-3'>
                {showActions && (
                  <>
                    <DialogClose asChild>
                      <Button
                        className='bg-green-600'
                        disabled={disableActionButtons}
                        onClick={handleAccept}
                      >
                        Accept
                      </Button>
                    </DialogClose>
                    {userRole === 'super-admin' && (
                      <DialogClose asChild>
                        <Button
                          className='bg-red-600'
                          disabled={
                            disableActionButtons || userRole !== 'super-admin'
                          }
                          onClick={handleReject}
                        >
                          Reject
                        </Button>
                      </DialogClose>
                    )}
                  </>
                )}
              </div>
            )}

            <DialogClose asChild>
              <X className='cursor-pointer' />
            </DialogClose>
          </div>
        </div>
      </DialogHeader>
      <div className=''>
        <div className='flex justify-center'>
          <Carousel className='w-[90%]' style={{ height: `${pageHeight}px` }}>
            <CarouselContent className='p-0'>
              {prescriptionList.map((item, index) => (
                <CarouselItem
                  key={index}
                  className='flex w-full flex-col items-center justify-center gap-3 overflow-hidden p-0'
                >
                  <div className='flex w-full items-center justify-center overflow-hidden p-0'>
                    {item?.endsWith('pdf') ? (
                      <iframe
                        id='inlineFrameExample'
                        title='Inline Frame Example'
                        width='100%'
                        height={pageHeight - 40}
                        src={item}
                        allowFullScreen={true}
                      ></iframe>
                    ) : (
                      <div
                        className='relative w-full'
                        style={{
                          height: `${pageHeight - 40}px`,
                          width: '100%'
                        }}
                      >
                        {item.includes('.heic') || item.includes('.heif') ? (
                          <div className='flex h-full items-center justify-center'>
                            <p className='text-lg text-red-600'>
                              Unsupported image format, please download and view
                              it.
                            </p>
                          </div>
                        ) : (
                          <Image
                            src={item}
                            fill
                            alt='Prescription'
                            objectFit='contain'
                            className='max-h-full max-w-full'
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {userRole !== 'store-admin' && (
                    <div>
                      <Button
                        className='bg-primary'
                        disabled={!item}
                        onClick={() => {
                          downloadFileFromURL(
                            item,
                            `Prescription-${orderId}.${item?.split('.')?.pop()}`
                          )
                        }}
                      >
                        Download File
                      </Button>
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </DialogContent>
  )
}
