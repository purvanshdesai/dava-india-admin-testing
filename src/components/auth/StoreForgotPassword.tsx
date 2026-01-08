'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
// import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { storeForgotPasswordSchema } from '@/lib/zod'
import React, { useState } from 'react'
import FormInputField from '@/components/form/FormInputField'
import { useStoreAdminForgotPassword } from '@/utils/hooks/storeAdminHooks'

export default function StoreForgotPassword() {
  const { toast } = useToast()
  // const searchParams = useSearchParams()
  const forgotPasswordMutation = useStoreAdminForgotPassword()
  const [submittedEmail, setSubmittedEmail] = useState<boolean>(false)

  // 1. Define your form.
  const form = useForm<z.infer<typeof storeForgotPasswordSchema>>({
    resolver: zodResolver(storeForgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof storeForgotPasswordSchema>) {
    try {
      await forgotPasswordMutation.mutateAsync({ email: values.email })
      setSubmittedEmail(true)
    } catch (e) {
      toast({
        description: 'Error!'
      })
    }
  }
  return (
    <div className={'h-screen w-screen bg-gray-200'}>
      <div className={'p-12'}>
        <Image src={'/images/logo.svg'} alt={'Logo'} width={200} height={100} />
      </div>
      <div
        className={
          'w-9/10 h-7/10 mx-16 flex items-center justify-center gap-5 rounded-lg bg-white py-16'
        }
      >
        <div className={'px-10'}>
          <Image
            src={'/images/store-login.svg'}
            alt={'Store Login'}
            height={500}
            width={500}
          />
        </div>
        <div className={'w-1/3 px-10'}>
          <div className={'py-8 text-2xl font-semibold'}>
            Store Reset Password
          </div>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
              >
                <div
                  style={{ display: submittedEmail ? 'none' : 'block' }}
                  className='space-y-8'
                >
                  <FormInputField
                    isSmall={true}
                    formInstance={form as unknown as UseFormReturn}
                    className={'w-full'}
                    placeholder='Email'
                    name={'email'}
                  />
                  <Button className={'w-full'}>Submit</Button>
                </div>
                <div style={{ display: submittedEmail ? 'block' : 'none' }}>
                  <h1>
                    Email has been sent to you with instructions to reset
                    password
                  </h1>
                </div>
              </form>
            </Form>
          </div>

          <div className={'py-3 text-center text-sm text-label'}>
            <Link href={'/store/login'} className='text-blue-500'>
              Click here
            </Link>{' '}
            for Store Admin login
          </div>
        </div>
      </div>
    </div>
  )
  // return (
  //   <div className='min-h-screen bg-white dark:bg-slate-900'>
  //     <div className='row-span-1 grid h-screen grid-cols-1 md:grid-cols-2'>
  //       <div className='h-screen bg-white dark:bg-slate-900'>
  //         <div
  //           style={{ borderBottomRightRadius: '100px' }}
  //           className='relative h-full bg-primary'
  //         >
  //           <Image
  //             src='/images/Login.svg'
  //             alt={'Login Welcome Image'}
  //             fill
  //             priority={true}
  //           />
  //         </div>
  //       </div>
  //
  //       <div className='h-screen bg-primary'>
  //         <div
  //           className='flex h-full flex-col items-center justify-center bg-white dark:bg-slate-900'
  //           style={{ borderTopLeftRadius: '100px' }}
  //         >
  //           <h1 className='text-3xl font-bold'>
  //             Welcome to <span className='text-primary'>Dava</span>
  //             <span className='text-primary-green'>india</span>
  //           </h1>
  //
  //           <div className='w-3/4 pt-12 lg:w-4/6'>
  //             <Form {...form}>
  //               <form
  //                 onSubmit={form.handleSubmit(onSubmit)}
  //                 className='space-y-8'
  //               >
  //                 <FormField
  //                   control={form.control}
  //                   name='email'
  //                   render={({ field }) => (
  //                     <FormItem>
  //                       <FormLabel>Email</FormLabel>
  //                       <FormControl>
  //                         <Input placeholder='email@address.com' {...field} />
  //                       </FormControl>
  //
  //                       <FormMessage />
  //                     </FormItem>
  //                   )}
  //                 />
  //                 <FormField
  //                   control={form.control}
  //                   name='password'
  //                   render={({ field }) => (
  //                     <FormItem>
  //                       <FormLabel>Password</FormLabel>
  //                       <FormControl>
  //                         <Input placeholder='******' {...field} />
  //                       </FormControl>
  //                       <FormMessage />
  //                     </FormItem>
  //                   )}
  //                 />
  //
  //                 <div className='pb-1 text-center'>
  //                   <Link
  //                     href={'/forgot-password'}
  //                     className='text-sm font-medium text-label hover:text-primary'
  //                   >
  //                     Forgot your password?
  //                   </Link>
  //                 </div>
  //
  //                 <div className='flex items-center space-x-4'>
  //                   <Switch
  //                     checked={isLoginSuperAdmin}
  //                     onCheckedChange={setIsLoginSuperAdmin}
  //                     id='airplane-mode'
  //                   />
  //                   <Label htmlFor='airplane-mode'>
  //                     Are you a super admin?
  //                   </Label>
  //                 </div>
  //
  //                 <Button type='submit' className='w-full'>
  //                   Sign In
  //                 </Button>
  //               </form>
  //             </Form>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )
}
