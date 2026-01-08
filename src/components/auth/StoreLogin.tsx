'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { handleCredentialSignIn } from '@/utils/actions/authActions'
import { useToast } from '@/hooks/use-toast'
// import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { signInSchema } from '@/lib/zod'
import React, { useState } from 'react'
import FormInputField from '@/components/form/FormInputField'
import FormPasswordField from '@/components/form/FormPasswordField'

export default function Login() {
  const { toast } = useToast()
  // const searchParams = useSearchParams()
  const [isLoginSuperAdmin] = useState(false)

  // 1. Define your form.
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signInSchema>) {
    try {
      // const callbackUrl = searchParams.get('callbackUrl')
      // const callbackUrl = ''

      await handleCredentialSignIn(values, isLoginSuperAdmin)
    } catch (e) {
      // console.log(e)
      toast({
        description: 'Error!'
      })
    }
  }
  return (
    <div className={'relative h-screen w-screen bg-gray-200 pt-44'}>
      <div
        className='absolute left-0 top-0 h-full w-full rounded-lg'
        style={{
          backgroundImage: `url('/images/LoginBg.png')`,
          backgroundColor: 'transparent',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          zIndex: 0
        }}
      />
      {/* <div className={'p-12'}>
        <Image src={'/images/Logo.svg'} alt={'Logo'} width={200} height={100} />
      </div> */}
      <div className='flex items-center justify-center'>
        <div
          className={
            'relative mx-16 flex w-1/2 items-center justify-center gap-5 rounded-lg bg-white pb-10 pt-24'
          }
        >
          <div className={'w-3/4'}>
            <div className={'absolute right-6 top-6'}>
              <Image
                src={'/images/Logo.svg'}
                alt={'Logo'}
                width={130}
                height={40}
              />
            </div>
            <div className={'absolute left-6 top-6'}>
              <Image
                src={'/images/DIA1.svg'}
                alt={'dia'}
                height={60}
                width={228}
              />
            </div>
            <div className={'py-2 text-lg font-semibold'}>Store Sign In</div>
            <div className=''>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-8'
                >
                  <FormInputField
                    isSmall={true}
                    formInstance={form as unknown as UseFormReturn}
                    className={'w-full'}
                    placeholder='Email'
                    name={'email'}
                  />
                  <FormPasswordField
                    isSmall={true}
                    formInstance={form as unknown as UseFormReturn}
                    placeholder='Password'
                    name={'password'}
                  />
                  <div className={'text-right'}>
                    <Link href={'/store/forgot-password'}>
                      <span className={'text-sm font-medium text-blue-500'}>
                        Forgot password?
                      </span>
                    </Link>
                  </div>
                  <Button className={'w-full'}>Sign In</Button>
                </form>
              </Form>
            </div>

            {/* <div className={'py-3 text-center text-sm text-label'}>
              <Link href={'/login'} className='text-blue-500'>
                Click here
              </Link>{' '}
              for Super Admin login
            </div> */}
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
