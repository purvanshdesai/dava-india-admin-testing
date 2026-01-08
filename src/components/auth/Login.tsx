'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { handleCredentialSignIn } from '@/utils/actions/authActions'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { signInSchema } from '@/lib/zod'
import FormPasswordField from '@/components/form/FormPasswordField'

export default function Login() {
  const { toast } = useToast()

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
      await handleCredentialSignIn(values, true)
    } catch (e) {
      console.log(e)
      toast({
        description: 'Invalid Credentials!'
      })
    }
  }
  return (
    <div className='relative flex min-h-screen w-full items-center justify-center dark:bg-slate-900'>
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
      <div className='z-10 flex w-full items-center justify-center'>
        <div className='relative flex h-full w-1/2 flex-col items-center justify-center rounded-lg bg-white p-12 dark:bg-slate-900'>
          <div className={'absolute right-6 top-6'}>
            <Image
              src={'/images/Logo.svg'}
              alt={'Logo'}
              width={130}
              height={40}
            />
          </div>
          {/* <h1 className='text-3xl font-bold'>
              Welcome to <span className='text-primary'>Dava</span>
              <span className='text-primary-green'>india</span>
            </h1> */}
          <div className={'absolute left-6 top-6'}>
            <Image
              src={'/images/DIA1.svg'}
              alt={'dia'}
              height={60}
              width={228}
            />
          </div>

          <div className='w-3/4 pt-10'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <div className='mb-6'>
                        <FormLabel className='text-lg font-semibold'>
                          Sign In
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder='email@address.com' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/*<FormField*/}
                {/*  control={form.control}*/}
                {/*  name='password'*/}
                {/*  render={({ field }) => (*/}
                {/*    <FormItem>*/}
                {/*      <FormLabel>Password</FormLabel>*/}
                {/*      <FormControl>*/}
                {/*        <Input placeholder='******' {...field} />*/}
                {/*      </FormControl>*/}
                {/*      <FormMessage />*/}
                {/*    </FormItem>*/}
                {/*  )}*/}
                {/*/>*/}
                <FormPasswordField
                  formInstance={form as unknown as UseFormReturn}
                  name={'password'}
                />

                <div className='pb-1 text-center'>
                  <Link
                    href={'/super-admin/forgot-password'}
                    className='text-sm font-medium text-label hover:text-primary'
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Button type='submit' className='w-full'>
                  Sign In
                </Button>
              </form>
            </Form>
          </div>

          {/* <div className={'py-3 text-sm text-label'}>
            <Link href={'/store/login'} className='text-blue-500'>
              Click here
            </Link>{' '}
            for Store Admin login
          </div> */}
          <div className={'absolute bottom-0 right-0'}>
            <Image
              src={'/images/LoginBottom.svg'}
              alt={'Bottom right image'}
              width={290}
              height={202}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
