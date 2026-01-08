'use client'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import dayjs from 'dayjs'

export default function ProductOverview({ details }: any) {
  return (
    <div>
      <div className={'py-3 text-lg font-semibold'}>Product Details</div>
      <div className={'flex gap-3 py-3 align-top'}>
        <div
          style={{ position: 'relative', width: '200px', height: '200px' }}
          className='overflow-hidden rounded-md'
        >
          {details?.productId?.images &&
            details.productId.images?.length > 0 && (
              <Image
                src={details.productId.images[0].objectUrl}
                alt={'Product'}
                fill
                loading={'lazy'}
                style={{ objectFit: 'contain' }}
              />
            )}
        </div>

        <div className={'flex flex-col gap-3 text-sm'}>
          <div className='text-lg font-semibold'>
            <span>{details.productId.title}</span>
          </div>
          <div>
            <span className={'font-semibold'}>Selling Price:</span>{' '}
            <span>{details.productId.finalPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className={'font-semibold'}>Description:</span>{' '}
            <span>{details.productId.description}</span>
          </div>
        </div>
      </div>
      <div className={'py-3'}>
        <div className={'pb-3 text-lg font-semibold'}>Stock Info</div>
        <div className='text-sm'>
          <span className={'font-semibold'}>Available Stock:</span>
          <span> {details.stock}</span>
        </div>
      </div>
      <div className={'w-1/3'}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={'text-center text-black'}>
                Batch No
              </TableHead>
              <TableHead className={'text-center text-black'}>
                Expiry Date
              </TableHead>
              <TableHead className={'text-center text-black'}>
                Stock Available
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details?.batches?.map((b: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className={'text-center'}>{b.batchNo}</TableCell>
                <TableCell className={'text-center'}>
                  {dayjs(b.expiryDate).format(process.env.DATE_FORMAT)}
                </TableCell>
                <TableCell className={'text-center'}>{b.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
