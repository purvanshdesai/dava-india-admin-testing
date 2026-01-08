import { X } from 'lucide-react'
import dayjs from 'dayjs'
import Image from 'next/image'
import { useState } from 'react'
import AlertBox from '@/components/AlertBox'
import { useAddActivity } from '@/utils/hooks/ticketHooks'
import { useQueryClient } from '@tanstack/react-query'

export default function AttachmentsTab({
  ticketDetails
}: {
  ticketDetails: any
}) {
  const { mutateAsync } = useAddActivity()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [attachmentToDelete, setAttachmentToDelete] = useState<any>(null)

  const confirmDeleteAttachment = (attachment: any) => {
    setAttachmentToDelete(attachment)
    setOpen(true)
  }

  const deleteSelectedAttachment = async () => {
    console.log('delete attachment === ', attachmentToDelete)

    await mutateAsync({
      ticketId: ticketDetails._id,
      activity: 'attachment-removed',
      attachments: [attachmentToDelete]
    })
    queryClient.invalidateQueries({ queryKey: ['fetch-ticket-details'] })
  }

  const openAttachment = (attachment: any) => {
    const link = attachment
    console.log('link ==== link')
    if (!link) return

    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const downloadAttachment = async (attachment: any) => {
    const link = attachment
    if (!link) return

    const fileName = attachment?.attachment?.objectDetails?.originalFileName

    try {
      // Fetch the image as a blob
      const response = await fetch(link)
      const blob = await response.blob()

      // Create a temporary object URL for the blob
      const blobUrl = URL.createObjectURL(blob)

      // Create an <a> element with the blob URL and trigger a download
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = fileName // Default file name
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error downloading the file:', error)
    }
  }

  return (
    <div className={'w-full bg-gray-100'}>
      <div className={'flex justify-center py-6 pt-3'}>
        <div className={'grid space-x-3 space-y-3'}>
          {(Array.isArray(ticketDetails?.attachments[0]?.objectUrl)
            ? ticketDetails.attachments[0].objectUrl
            : ticketDetails?.attachments[0]?.objectUrl
              ? [ticketDetails.attachments[0].objectUrl]
              : []
          ).map((attachment: any, index: number) => {
            const isPDF =
              typeof attachment === 'string' &&
              attachment.toLowerCase().includes('.pdf')
            return (
              <div
                key={index}
                className={
                  'ml-3 mt-3 flex w-80 items-center gap-3 rounded-lg border border-gray-300 bg-white px-2 py-3 text-sm'
                }
              >
                <div>
                  {isPDF ? (
                    <iframe
                      src={attachment}
                      title={`pdf-preview-${index}`}
                      width={50}
                      height={50}
                      className='rounded border'
                    />
                  ) : (
                    <Image
                      src={attachment}
                      alt={'image'}
                      height={50}
                      width={50}
                    />
                  )}
                </div>
                <div className={'flex w-full flex-col'}>
                  <div className={'flex items-center justify-between'}>
                    <div>Screenshot</div>
                    <div className={'flex items-center gap-1'}>
                      <X
                        className={'cursor-pointer'}
                        size={18}
                        onClick={() => confirmDeleteAttachment(attachment)}
                      />
                    </div>
                  </div>
                  <div className={'text-label'}>
                    Added at{' '}
                    {dayjs(attachment.createdAt).format(
                      process.env.DATE_TIME_FORMAT
                    )}
                  </div>
                  <div className={'flex items-center gap-2'}>
                    <div
                      className={'cursor-pointer underline'}
                      onClick={() => openAttachment(attachment)}
                    >
                      Open
                    </div>
                    <div
                      className={'h-1.5 w-1.5 rounded-full bg-gray-400'}
                    ></div>
                    <div
                      className={'cursor-pointer underline'}
                      onClick={() => downloadAttachment(attachment)}
                    >
                      Download
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AlertBox
        openState={[open, setOpen]}
        content={'Are you sure you want to delete this attachment?'}
        onContinue={deleteSelectedAttachment}
      />
    </div>
  )
}
