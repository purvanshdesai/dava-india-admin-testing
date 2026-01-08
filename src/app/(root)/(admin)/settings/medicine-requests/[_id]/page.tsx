'use client'

import { useParams } from 'next/navigation'
import {
  useFetchMedicineRequestById,
  useUpdateRequestMedicine
} from '@/utils/hooks/requestMedicineHooks'
import AppBreadcrumb from '@/components/Breadcrumb'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog'
import PdfViewerComponent from '@/components/utils/PdfViewver'

export default function RequestDetailsPage() {
  const router = useRouter()
  const { _id } = useParams()
  const { data, isLoading } = useFetchMedicineRequestById(_id as string)
  const { mutateAsync: updateRequestMedicine, isPending } =
    useUpdateRequestMedicine()

  const handleRequestCompleted = async () => {
    try {
      await updateRequestMedicine({ requestId: data?._id, status: 'closed' })
      router.back()
    } catch (e) {
      console.log(e)
    }
  }

  if (isLoading) {
    return <p className='p-6'>Loading request details...</p>
  }

  if (!data) {
    return <p className='p-6 text-red-600'>Request not found.</p>
  }

  return (
    <div className='w-full space-y-6 pb-12'>
      <div className='border-b pb-4'>
        <AppBreadcrumb
          locations={[
            { page: 'Request Medicine', href: '/settings/medicine-requests' },
            { page: `Request No : ${data.requestNo}` }
          ]}
        />
      </div>

      <section className='rounded-lg border bg-white p-5'>
        <h2 className='mb-4 text-lg font-semibold text-gray-800'>
          Customer Information
        </h2>
        <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
          <div>
            <p className='font-semibold text-gray-600'>Customer Name</p>
            <p>{data.requestedUser?.name || '-'}</p>
          </div>
          <div>
            <p className='font-semibold text-gray-600'>Customer Phone No.</p>
            <p>{data.requestedUser?.phoneNumber || '-'}</p>
          </div>
          <div>
            <p className='font-semibold text-gray-600'>Customer Email</p>
            <p>{data.requestedUser?.email || '-'}</p>
          </div>
        </div>
      </section>

      <section className='rounded-lg border bg-white p-5'>
        <h2 className='mb-4 text-lg font-semibold text-gray-800'>
          Request Information
        </h2>
        <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
          <div>
            <p className='font-semibold text-gray-600'>Request No</p>
            <p>{data.requestNo}</p>
          </div>
          <div>
            <p className='font-semibold text-gray-600'>Request Date</p>
            <p>{new Date(data.requestedDate).toLocaleString()}</p>
          </div>
          <div>
            <p className='font-semibold text-gray-600'>Request Status</p>
            <p className='capitalize text-primary'>{data.status}</p>
          </div>
          <div>
            <p className='font-semibold text-gray-600'>Medicine Requested</p>
            <p>{data.medicineName}</p>
          </div>
        </div>
      </section>

      <section className='rounded-lg border bg-white p-5'>
        <h2 className='mb-4 text-lg font-semibold text-gray-800'>
          Notes and Images
        </h2>

        <div className='mb-4 text-sm'>
          <p className='font-semibold text-gray-600'>Notes</p>
          <p>{data.notes || 'No notes added.'}</p>
        </div>

        <div>
          <p className='mb-2 font-semibold text-gray-600'>Images</p>
          <div className='flex flex-wrap gap-4'>
            {data.files?.length ? (
              data.files.map((file: string, index: number) => {
                const isPDF = file.toLowerCase().includes('.pdf')

                return (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className='h-32 w-32 cursor-pointer overflow-hidden rounded-lg border hover:opacity-80'>
                        {isPDF ? (
                          // Use PdfViewerComponent for PDFs
                          <PdfViewerComponent
                            pdfUrl={file}
                            fileName={`Attachment_${index}`}
                          />
                        ) : (
                          // Render image for non-PDF files
                          <Image
                            src={file}
                            alt={`Attachment ${index + 1}`}
                            width={128}
                            height={128}
                            className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
                          />
                        )}
                      </div>
                    </DialogTrigger>

                    <DialogContent className='fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 transform rounded-xl bg-white p-0 shadow-lg'>
                      <DialogClose asChild>
                        <button
                          className='absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80'
                          aria-label='Close'
                        >
                          ✕
                        </button>
                      </DialogClose>

                      <div className='relative flex h-[80vh] w-full items-center justify-center p-4'>
                        {isPDF ? (
                          // Add scroll functionality to the PDF
                          <div className="overflow-y-scroll h-full w-full">
                            <PdfViewerComponent
                              pdfUrl={file}
                              fileName={`Attachment_${index}`}
                            />
                          </div>
                        ) : (
                          <Image
                            src={file}
                            alt={`Zoomed image ${index + 1}`}
                            fill
                            className='rounded-xl object-contain'
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              })
            ) : (
              <p className='text-gray-500'>No images available</p>
            )}
          </div>
        </div>
      </section>

      {data?.status === 'open' && (
        <div className='flex justify-end gap-3 border-t pt-4'>
          <Button variant='outline' className='w-32 text-gray-700'>
            Cancel
          </Button>
          <Button
            className='w-40 bg-[#E75425] hover:bg-[#d34a1e]'
            onClick={() => handleRequestCompleted()}
            disabled={isPending}
          >
            Request Completed
          </Button>
        </div>
      )}
    </div>
  )
}
