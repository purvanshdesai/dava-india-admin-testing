'use client'
import ViewPrescription from '../OrderDetails/ViewPrescription'
import AddAssociatedProductsModal from '@/components/products/ProductDetails/AddAssociatedProductsModal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { useFooter } from '@/context/Footer'
import { useToast } from '@/hooks/use-toast'
import { useTicketPrescriptionStatus } from '@/utils/hooks/prescriptionStatus'
import { useFetchTicketDetails } from '@/utils/hooks/ticketHooks'
import dayjs from 'dayjs'
import {
  CircleMinus,
  CirclePlus,
  Copy,
  IndianRupee,
  Loader2,
  Mail,
  Smartphone,
  Trash2
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Footer = ({
  onSubmit,
  onBack,
  submitting = false
}: {
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}) => {
  return (
    <div className={'flex h-full items-center justify-end gap-4 px-5'}>
      <Button variant={'destructive'} onClick={onBack}>
        Reject
      </Button>
      <Button
        disabled={submitting}
        className={'w-24 bg-green-500 text-center hover:bg-green-500'}
        onClick={onSubmit}
      >
        {submitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
        Approve
      </Button>
    </div>
  )
}

export default function PrescriptionOrder({
  params
}: {
  params: { inquiryId: string }
}) {
  const ticketId = params?.inquiryId
  const { data: ticket, isPending } = useFetchTicketDetails(ticketId)
  const [products, setProducts] = useState<any[]>([])
  const prescriptionStatusMutation = useTicketPrescriptionStatus()
  const [errorMsg, setErrorMsg] = useState('')
  const { setFooterContent } = useFooter()
  const router = useRouter()
  const { toast } = useToast()

  const handleAddProduct = (values: any[]) => {
    setProducts(prev => [
      ...prev,
      ...values.map(item => ({ ...item, quantity: 1 }))
    ])
  }
  const removeProduct = (productId: string) => {
    setProducts(prev => prev?.filter((item: any) => item?._id != productId))
  }

  const handlePrescriptionStatusChange = async (status: string) => {
    try {
      console.log(status)
      console.log(products.length)
      if (status == 'accept' && !products.length) {
        setErrorMsg('Please select products before approving')
        return
      }
      await prescriptionStatusMutation.mutateAsync({
        status,
        ticketId,
        items: products.map((product: any) => ({
          productId: product?._id,
          quantity: product?.quantity
        }))
      })
      router.back()
    } catch (error) {
      throw error
    }
  }
  const copyToClipboard = (entity: string, text: string) => {
    if (!text) return

    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Text copied to clipboard!')
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
      })
    toast({ title: 'Copied', description: `${entity} copied to clipboard` })
  }

  const handleReduceQuantity = (productId: any, currentQuantity: any) => {
    if (currentQuantity > 1)
      setProducts(prev =>
        prev.map((item: any) =>
          item?._id == productId
            ? { ...item, quantity: item?.quantity - 1 }
            : { ...item }
        )
      )
  }

  const handleIncQuantity = (productId: any) => {
    setProducts(prev =>
      prev.map((item: any) =>
        item?._id == productId
          ? { ...item, quantity: item?.quantity + 1 }
          : { ...item }
      )
    )
  }

  useEffect(() => {
    if (ticket) {
      if (ticket?.order?.items?.length) {
        setProducts(
          ticket?.order?.items?.map((item: any) => ({
            ...item?.productId,
            quantity: item?.quantity
          }))
        )
      }
    }
  }, [ticket])

  useEffect(() => {
    setFooterContent(
      <Footer
        onSubmit={() => handlePrescriptionStatusChange('accept')}
        onBack={() => handlePrescriptionStatusChange('reject')}
        submitting={prescriptionStatusMutation.isPending}
      />
    )
    return () => {
      setFooterContent(null)
    }
  }, [products])

  if (isPending) {
    return <div>Loading</div>
  }
  return (
    <div>
      <div className='border border-[#CACACA] bg-[#F9FBFD] p-6'>
        <h1 className='mb-3 text-lg font-medium'>Order Details</h1>
        <div className='flex flex-col gap-2'>
          <p>{ticket?.createdBy?.name}</p>
          <div className={'flex items-center gap-3'}>
            <Mail color={'#E75634'} size={18} />
            <div>{ticket?.createdBy?.email}</div>
            <Copy
              className={'cursor-pointer'}
              color={'#222222'}
              size={18}
              onClick={() => copyToClipboard('Email', ticket?.createdBy?.email)}
            />
          </div>
          <div className={'flex items-center gap-3'}>
            <Smartphone color={'#E75634'} size={18} />
            <div>{ticket?.createdBy?.phoneNumber}</div>
            <Copy
              className={'cursor-pointer'}
              color={'#222222'}
              size={18}
              onClick={() =>
                copyToClipboard('Email', ticket?.createdBy?.phoneNumber)
              }
            />
          </div>
          <p>Order No: {ticket?.order?.orderId || ticket?.order?._id}</p>
          <p>Order Date: {dayjs(ticket?.createdAt).format('DD MMMM YYYY')}</p>
        </div>
      </div>
      <div className='my-4 flex items-center justify-between border border-[#CACACA] bg-[#F9FBFD] p-5'>
        <p>Prescription</p>
        <Dialog>
          <DialogTrigger>
            {' '}
            <Button>View prescription</Button>
          </DialogTrigger>
          <ViewPrescription
            orderId={ticket?.order?.orderId}
            status='paid'
            showActions={false}
            prescription={ticket?.prescriptionUrl}
            handlePrescriptionStatusChange={handlePrescriptionStatusChange}
          />
        </Dialog>
      </div>

      <div className='mt-4'>
        {errorMsg?.length ? <p className='text-red-600'>{errorMsg}</p> : null}
        <div className='flex items-center justify-between border border-[#CACACA] bg-[#F9FBFD] p-5'>
          <p>Medicines Attached</p>
          <AddAssociatedProductsModal
            AddProduct={(values: any) => handleAddProduct(values)}
            alreadyExistProductIds={products?.map((item: any) => item?._id)}
            ticket={ticket}
            showProductStock={true}
            disableOnNoStock={true}
          />
        </div>
      </div>
      <div className='border border-b-0 border-t-0 border-[#CACACA] bg-[#F9FBFD]'>
        {products?.map((item: any, index: number) => (
          <div
            key={index}
            className='flex items-start justify-between border-b border-[#CACACA] p-4'
          >
            <div className='flex gap-4'>
              <Image
                src={item?.thumbnail}
                alt=''
                width={96}
                height={96}
                className='rounded-md'
              />
              <div className='flex flex-col gap-1.5'>
                <p className='font-semibold'>{item?.title}</p>
                <p className='text-[#8F8F8F]'>
                  Composition: {item?.compositions}
                </p>
                <p className='flex items-center gap-1 text-[#8F8F8F]'>
                  Price: <IndianRupee size={16} />
                  {item?.unitPrice}
                </p>
                <div className='flex items-center gap-2'>
                  <p className='text-black'>Quantity:</p>
                  <div className='flex items-center gap-3'>
                    <CircleMinus
                      className='cursor-pointer'
                      onClick={() =>
                        handleReduceQuantity(item?._id, item?.quantity)
                      }
                    />
                    <p className='text-lg font-semibold text-black'>
                      {item?.quantity}
                    </p>
                    <CirclePlus
                      className='cursor-pointer'
                      onClick={() => handleIncQuantity(item?._id)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Trash2
                color='red'
                className='cursor-pointer'
                onClick={() => removeProduct(item?._id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
