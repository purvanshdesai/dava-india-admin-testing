import React, { useEffect } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { pharmacistSchema } from '@/lib/zod'
import { z } from 'zod'
import FormInputField from '../form/FormInputField'

export type Pharmacist = z.infer<typeof pharmacistSchema>
export default function PharmacistDialog({
  onSave,
  initialData,
  triggerButton,
  isEdit = false
}: {
  onSave: (data: Pharmacist) => void
  initialData?: Pharmacist
  isEdit?: boolean
  triggerButton: React.ReactNode
}) {
  const form = useForm<Pharmacist>({
    resolver: zodResolver(pharmacistSchema),
    defaultValues: initialData ?? {
      name: '',
      employeeId: '',
      phoneNumber: '',
      pin: ''
    }
  })

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData])

  const [open, setOpen] = React.useState(false)

  const onSubmit = (data: Pharmacist) => {
    onSave(data)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Pharmacist' : 'Add Pharmacist'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormInputField
              formInstance={form as unknown as UseFormReturn}
              name={'name'}
              label={'Pharmacist Name'}
              placeholder={'Enter Pharmacist Name'}
              isSmall={true}
              isReq={true}
            />
            <FormInputField
              formInstance={form as unknown as UseFormReturn}
              name={'employeeId'}
              label={'Employee Id '}
              placeholder={'Enter Employee Id'}
              isSmall={true}
              isReq={true}
            />
            <FormInputField
              formInstance={form as unknown as UseFormReturn}
              name={'phoneNumber'}
              label={'Phone Number '}
              placeholder={'Enter Phone Number'}
              isSmall={true}
              isReq={true}
            />
            <FormInputField
              formInstance={form as unknown as UseFormReturn}
              name={'pin'}
              label={'Pin '}
              placeholder={'Enter Pin'}
              isSmall={true}
              isReq={true}
            />

            <DialogFooter className='item-center mt-4 flex'>
              <DialogClose>
                <Button variant={'ghost'}>Cancel</Button>
              </DialogClose>
              <Button type='submit'>{isEdit ? 'Update' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
