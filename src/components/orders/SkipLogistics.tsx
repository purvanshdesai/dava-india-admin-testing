'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useSkipOrderLogistics } from '@/utils/hooks/orderHooks'

export default function SkipLogisticsDialog({
  orderId,
  orderTrackingId,
  skipLogistics,
  onSuccess
}: {
  orderId: string
  orderTrackingId: string
  skipLogistics: boolean
  onSuccess: () => void
}) {
  const [open, setOpen] = React.useState(false)

  const { mutateAsync: skipOrderLogistics } = useSkipOrderLogistics()

  const onConfirm = async () => {
    try {
      await skipOrderLogistics({
        orderId,
        orderTrackingId,
        skipLogistics: !skipLogistics
      })

      onSuccess()
      setOpen(false)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger button */}
      <DialogTrigger asChild className='w-full'>
        <Button variant='destructive'>
          {skipLogistics ? 'Unskip' : 'Skip'} Logistics
        </Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {skipLogistics ? 'Unskip' : 'Skip'} Logistics?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {skipLogistics ? 'unskip' : 'skip'}{' '}
            logistics?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
