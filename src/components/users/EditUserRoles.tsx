'use client'
import { toast } from '@/hooks/use-toast'
import { editUserSchema } from '@/lib/zod'
import { useFetchRoles } from '@/utils/hooks/rolesHook'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { Form } from '../ui/form'
import FormSelectField from '../form/FormSelectField'
import { DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { usePatchAdminUser } from '@/utils/hooks/superAdminHooks'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useRouter } from 'next/navigation'

export default function EditUserForm({ table, data }: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const userData = data?.data ? data?.data : data

  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      role: userData?.role?._id ? userData?.role?._id : ''
    }
  })

  const { data: roles } = useFetchRoles()

  const patchAdminUserMutation = usePatchAdminUser()

  const submitAddStore = async (values: z.infer<typeof editUserSchema>) => {
    try {
      setLoading(true)

      await patchAdminUserMutation.mutateAsync({
        superId: userData._id,
        data: values
      })
      toast({
        title: 'Success',
        description: 'User role has updated successfully!'
      })
      router.push(
        `?page=${table.getState().pagination.pageIndex}&limit=${table.getState().pagination.pageSize}`
      )
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      {' '}
      <div className='flex gap-3'>
        <Avatar>
          <AvatarImage src='https://github.com/shadcn.png' />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-1 text-xs'>
          <span>Name: {userData?.name}</span>
          <span>Email: {userData?.email}</span>
          <span>Role: {userData?.role?.roleName}</span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitAddStore)}>
          <div className='flex flex-col gap-4'>
            <FormSelectField
              formInstance={form as unknown as UseFormReturn}
              isSmall={true}
              isReq={true}
              label={'Select Role'}
              name={'role'}
              placeholder={'Select Role'}
              items={(roles?.data as any)?.map((c: any) => ({
                label: c.roleName,
                value: c._id
              }))}
            />

            <div className='-mb-6 mt-4 grid grid-cols-2 gap-4'>
              {' '}
              <DialogClose>
                <Button
                  type='button'
                  className={
                    'w-56 border border-orange-500 bg-white text-center text-orange-500 hover:bg-white'
                  }
                >
                  Cancel
                </Button>{' '}
              </DialogClose>
              <DialogClose>
                <Button
                  type='submit'
                  loader={loading}
                  className={'w-56 text-center'}
                >
                  Update
                </Button>
              </DialogClose>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
