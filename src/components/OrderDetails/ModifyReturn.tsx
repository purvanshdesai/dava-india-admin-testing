'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getModifyReturnSchema } from '@/lib/zod'
import { useAdminModifyReturn } from '@/utils/hooks/orderHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface ModifyReturnProps {
  maxQuantity: number
  orderItemTrackingId: string
  orderItemId: string
  refreshData: (...props: any) => void
}

export default function ModifyReturnQuantity({
  maxQuantity,
  orderItemTrackingId,
  orderItemId,
  refreshData
}: ModifyReturnProps) {
  const [open, setOpen] = useState(false)
  const { mutateAsync: handleModifyReturn, isPending } = useAdminModifyReturn()

  const formSchema = getModifyReturnSchema(maxQuantity)

  const form = useForm<z.infer<typeof formSchema> & { quantity?: number }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await handleModifyReturn({
      orderItemTrackingId,
      orderItemId,
      returnQuantity: values.quantity
    })
    setOpen(false)
    refreshData()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Modify Return Quantity</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modify Return Quantity</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5 pt-4'
          >
            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      max={maxQuantity}
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className='text-muted-foreground text-sm'>
              Maximum quantity: {maxQuantity}
            </p>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button type='submit' disabled={isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
