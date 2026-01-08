'use client'
import { Row } from '@tanstack/react-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useVerifyPharmacist } from '@/utils/hooks/storePharmacistHooks'
import Image from 'next/image'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row
}: DataTableRowActionsProps<TData>) {
  // const task = categorySchema.parse(row.original)
  const router = useRouter()
  const session: any = useSession()
  const task: any = row?.original
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const storeId = session?.data?.user?.storeIds[0]

  const { mutateAsync: verify, isPending } = useVerifyPharmacist()

  const handleVerify = async () => {
    setError('')
    try {
      const result = await verify({ storeId: storeId, pin })

      if (result?.success === true) {
        router.push(`/store/orders/${task._id}?pharmacist=${result?.data?._id}`)
      } else {
        setError('Invalid PIN')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className='flex w-[160px] justify-center'>
      <div>
        <Button
          onClick={() => setOpen(true)}
          className='h-full w-12 rounded-md border bg-primary px-4 py-1 text-white'
        >
          View
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Pharmacist PIN</DialogTitle>
            </DialogHeader>
            <Image
              className='mx-auto'
              src={'/images/Pharmacist.svg'}
              alt={'dia'}
              height={60}
              width={228}
            />

            <Input
              type='text'
              placeholder='Enter your PIN'
              value={pin}
              onChange={e => setPin(e.target.value)}
              autoComplete='off'
              style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties}
            />

            {error && <p className='mx-auto text-sm text-red-600'>{error}</p>}

            <DialogFooter className='mt-4'>
              <Button disabled={isPending || !pin} onClick={handleVerify}>
                {isPending ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
