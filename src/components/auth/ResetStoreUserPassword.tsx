'use client'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { resetPasswordSchema } from '@/lib/zod'
import {
  useCheckTokenValidity,
  useResetPassword
} from '@/utils/hooks/storeAdminResetPasswordHook'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FormPasswordField from '@/components/form/FormPasswordField'
import LoadingSpinner from '../LoadingSpinner'

export default function ResetStoreUserPassword() {
  const [isTokenValid, setIsTokenValid] = useState(false)
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    values: {
      newPassword: '',
      confirmPassword: ''
    }
  })
  const searchParams = useSearchParams()
  const router = useRouter()

  const resetPasswordMutation = useResetPassword()
  const { data: tokenValidityData, isLoading } = useCheckTokenValidity(
    searchParams.get('token') || ''
  )

  const handleSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    try {
      const token: any = searchParams.get('token') || ''
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: data?.newPassword
      })
      router.push('/store/login')
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    if (tokenValidityData) {
      setIsTokenValid(tokenValidityData.tokenValid)
    }
  }, [tokenValidityData])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className={'h-screen w-screen bg-gray-200'}>
      <div className={'p-12'}>
        <Image src={'/images/Logo.svg'} alt={'Logo'} width={200} height={100} />
      </div>
      <div className={'w-9/10 mx-16 min-h-[480px] rounded-lg bg-white py-16'}>
        {isTokenValid ? (
          <div className='flex items-center justify-center gap-5'>
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
                Set your password
              </div>
              <div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className='space-y-8'
                  >
                    <FormPasswordField
                      isSmall={true}
                      formInstance={form as unknown as UseFormReturn}
                      className={'w-full'}
                      placeholder='New Password'
                      name={'newPassword'}
                    />
                    <FormPasswordField
                      isSmall={true}
                      formInstance={form as unknown as UseFormReturn}
                      placeholder='Confirm Password'
                      name={'confirmPassword'}
                    />
                    <Button className={'w-full'}>Submit</Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        ) : (
          <div className='mt-16 flex w-full flex-col items-center justify-center gap-5'>
            <Image
              src='/images/expire.svg'
              alt={'Login Welcome Image'}
              width={102}
              height={102}
              priority={true}
            />
            <p className='text-lg font-semibold'>
              Sorry, This link is expired for now. You can contact Davaindia for
              more details
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
