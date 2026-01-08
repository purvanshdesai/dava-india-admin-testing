'use client'
import { Button } from '../ui/button'
import { DataTable } from '../ui/DataTable/data-table'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { usersColumns } from './columns'
import FormDialog from '../form/FormDialogBox'
import FormInputField from '../form/FormInputField'
import FormSelectField from '../form/FormSelectField'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { newUserSchema } from '@/lib/zod'
import { Form } from '../ui/form'
import { useFetchSuperAdminUsers } from '@/utils/hooks/superAdminHooks'
import { useFetchRoles } from '@/utils/hooks/rolesHook'
import { useCreateUserInvitation } from '@/utils/hooks/userInvitationHooks'
import { useSession } from 'next-auth/react'
import { DialogClose } from '../ui/dialog'
import crypto from 'crypto'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'
import { toast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'

const Users = () => {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const [pagination, setPagination] = useState({
    pageIndex: page ? +page : 0,
    pageSize: limit ? +limit : 10
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data: users, isLoading } = useFetchSuperAdminUsers({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: columnFilters
  })

  const activeFilter: any = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ]
  return (
    <>
      <div className='xxl:px-8 mt-4 hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='flex items-center gap-1 font-semibold'>
              Users
              {hasPermission(
                MODULES_PERMISSIONS.USER_MANAGEMENT.key,
                MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.READ_USERS
              ) && (
                <span className='text-sm text-label'>
                  ({users?.total ?? 0}){' '}
                </span>
              )}
            </h2>
          </div>
          <div className='flex items-center gap-4'>
            {hasPermission(
              MODULES_PERMISSIONS.USER_MANAGEMENT.key,
              MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.CREATE_USERS
            ) ? (
              <FormDialog
                footerNotReq={true}
                content={<AddNewUserForm />}
                trigger={
                  <Button size={'sm'} className='flex items-center gap-2'>
                    <Plus />
                    Add New User
                  </Button>
                }
                title={'Add New User'}
                footerActions={null}
              />
            ) : null}
          </div>
        </div>
        <div className='pb-8'>
          {hasPermission(
            MODULES_PERMISSIONS.USER_MANAGEMENT.key,
            MODULES_PERMISSIONS.USER_MANAGEMENT.permissions.READ_USERS
          ) ? (
            <DataTable
              data={users?.data ?? []}
              totalRows={users?.total}
              columns={usersColumns}
              page='users'
              pagination={pagination}
              isLoading={isLoading}
              setPagination={setPagination}
              setColumnFilters={setColumnFilters}
              columnFilters={columnFilters}
              filters={{
                activeFilter,
                search: { by: 'email', placeholder: 'Search Users ...' }
              }}
            />
          ) : (
            <div>You don't have access to read the users!</div>
          )}
        </div>
      </div>
    </>
  )
}

// Form
const AddNewUserForm = () => {
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof newUserSchema>>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      extraAttr: {
        doctorName: '',
        qualification: '',
        regNo: '',
        doctorWhatsappNumber: '',
        hospitalName: '',
        hospitalAddress: ''
      }
    }
  })

  const selectedRole = form.watch('role')

  const { data: roles } = useFetchRoles({ noPagination: true })
  const createInvitationMutation = useCreateUserInvitation()
  const { data: session } = useSession()
  const userId = session?.user.id

  const submitAddStore = async (values: z.infer<typeof newUserSchema>) => {
    try {
      setLoading(true)
      const payload = {
        ...values,
        invitedBy: userId,
        status: 'invited',
        expiryAt: new Date().setHours(new Date().getHours() + 24),
        token: generateToken()
      }

      await createInvitationMutation.mutateAsync(payload)

      toast({
        title: 'Success',
        description: 'User has been invited!'
      })
    } catch (error: any) {
      toast({
        title: 'Oops',
        description: `${error?.response?.data?.message}`
      })
      console.log('err', error)
    } finally {
      setLoading(false)
    }
  }

  function generateToken() {
    return crypto.randomBytes(32).toString('hex').substring(0, 10)
  }

  return (
    <div>
      {' '}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitAddStore)}>
          <div className='flex max-h-96 flex-col gap-4 overflow-auto px-4'>
            <FormInputField
              formInstance={form as unknown as UseFormReturn}
              name={'name'}
              label={'User Name'}
              placeholder={'Enter User Name'}
              isSmall={true}
              isReq={true}
            />

            <FormInputField
              formInstance={form as unknown as UseFormReturn}
              name={'email'}
              label={'User Email'}
              placeholder={'Enter User Email'}
              isSmall={true}
              isReq={true}
            />

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

            {roles?.data.some(
              (role: any) =>
                role._id === selectedRole && role.roleName.includes('Doctor')
            ) && (
              <div className='border-t-2'>
                <div className='my-2'>Doctor Details</div>
                <div className='grid grid-cols-2 gap-4'>
                  <FormInputField
                    formInstance={form as unknown as UseFormReturn}
                    name={'extraAttr.doctorName'}
                    label={'Doctor Name'}
                    placeholder={'Enter Doctor Name'}
                    isSmall={true}
                    isReq={true}
                  />
                  <FormInputField
                    formInstance={form as unknown as UseFormReturn}
                    name={'extraAttr.qualification'}
                    label={'Qualification'}
                    placeholder={'Enter Qualification'}
                    isSmall={true}
                    isReq={true}
                  />
                  <FormInputField
                    formInstance={form as unknown as UseFormReturn}
                    name={'extraAttr.doctorWhatsappNumber'}
                    label={'Whatsapp Number '}
                    placeholder={'Enter whatsapp Number'}
                    isSmall={true}
                    isReq={true}
                  />
                  <FormInputField
                    formInstance={form as unknown as UseFormReturn}
                    name={'extraAttr.regNo'}
                    label={'KMC Number'}
                    placeholder={'Enter Registration Number'}
                    isSmall={true}
                    isReq={true}
                  />
                  <FormInputField
                    formInstance={form as unknown as UseFormReturn}
                    name={'extraAttr.hospitalName'}
                    label={'Hospital Name'}
                    placeholder={'Enter Hospital Name'}
                    isSmall={true}
                    isReq={true}
                  />
                  <FormInputField
                    formInstance={form as unknown as UseFormReturn}
                    name={'extraAttr.hospitalAddress'}
                    label={'Hospital Address'}
                    placeholder={'Enter Hospital Address'}
                    isSmall={true}
                    isReq={true}
                  />
                </div>
              </div>
            )}

            <div className='-mb-6 mt-4 grid grid-cols-2 gap-4'>
              {' '}
              <DialogClose>
                <Button
                  type='button'
                  className={
                    'w-full border border-orange-500 bg-white text-center text-orange-500'
                  }
                >
                  Cancel
                </Button>{' '}
              </DialogClose>
              <DialogClose>
                <Button
                  type='submit'
                  loader={loading}
                  className={'w-full text-center'}
                >
                  Submit
                </Button>
              </DialogClose>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Users
