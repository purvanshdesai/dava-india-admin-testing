/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '../ui/separator'
import {
  ImagesIcon,
  GalleryHorizontalIcon,
  ImageIcon,
  LayoutDashboardIcon,
  Layers3Icon,
  InfoIcon,
  StarsIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const layouts = [
  { title: 'Main Banner', type: 'carousel', icon: ImagesIcon },
  { title: 'Mini Banner', type: 'carousel-mini', icon: GalleryHorizontalIcon },
  { title: 'Image', type: 'image', icon: ImageIcon },
  {
    title: 'Featured Products',
    type: 'featured-products',
    icon: LayoutDashboardIcon
  },
  {
    title: 'Featured Collections',
    type: 'featured-categories',
    icon: Layers3Icon
  },
  {
    title: 'Davaone Membership',
    type: 'davaone-membership',
    icon: StarsIcon
  },
  {
    title: 'Generic Medicine Info',
    type: 'generic-medicine-info',
    icon: InfoIcon
  }
]

const AddSponsoredLayoutModal = ({
  hideMembership,
  hideGenericInfo
}: {
  hideMembership: boolean
  hideGenericInfo: boolean
}) => {
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false)

  const onSelectLayout = (layout: string) => {
    if (layout === 'image') {
      router.push(`/sponsored-layout/image/new?type=${layout}`)
      return
    }

    router.push(`/sponsored-layout/new?type=${layout}`)
  }

  return (
    <div>
      <Dialog open={openModal}>
        <DialogTrigger>
          <div
            className='rounded-md bg-primary px-3 py-1.5 text-sm text-white'
            onClick={() => setOpenModal(true)}
          >
            Add New Section
          </div>
        </DialogTrigger>
        <DialogContent className='max-w-[50%] p-0'>
          <div className='p-5'>
            <p className='font-semibold'>Add New Sponsored Sections</p>

            <div className='py-5'>
              <Separator />
            </div>

            <div className='grid grid-cols-3 items-center gap-6'>
              {layouts?.map((l, idx) => {
                if (hideMembership && l.type == 'davaone-membership')
                  return <></>
                if (hideGenericInfo && l.type == 'generic-medicine-info')
                  return <></>

                const Icon = l.icon

                return (
                  <div
                    key={idx}
                    className='w-auto cursor-pointer rounded-md border p-3 duration-300 hover:scale-105 hover:border-primary'
                    onClick={() => onSelectLayout(l.type)}
                  >
                    <div className='flex items-center justify-center p-3'>
                      <Icon size={30} className='text-label' />
                    </div>
                    <p className='text-center text-sm font-semibold'>
                      {l.title}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
          <DialogFooter className='flex items-center justify-center'>
            <div className='flex w-full justify-center p-5'>
              <Button
                type='button'
                variant={'outline'}
                className='w-40'
                onClick={() => {
                  setOpenModal(false)
                }}
              >
                <p>Cancel</p>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddSponsoredLayoutModal
