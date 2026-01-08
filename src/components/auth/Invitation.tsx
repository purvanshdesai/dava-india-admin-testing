'use client'
import { Button } from '@/components/ui/button'
import {
  usePatchInvitation,
  useValidateInvitation
} from '@/utils/hooks/userInvitationHooks'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Invitation() {
  const params = useSearchParams()
  const [verifiedData, setVerifiedData] = useState<any>({})
  const [isAccepted, setIsAccepted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { mutateAsync: verifyToken } = useValidateInvitation()
  const router = useRouter()

  const invitationToken = params.get('invitationToken')
  const patchInvitationMutation = usePatchInvitation()

  useEffect(() => {
    const validateToken = async () => {
      if (invitationToken) {
        try {
          const res = await verifyToken({
            invitationToken: invitationToken
          })
          if (res && res.invitation) {
            setVerifiedData(res)

            if (res.invitation.status === 'accepted') {
              setIsAccepted(true)
            } else if (res.invitation.status === 'rejected') {
              setErrorMessage('You have already rejected this invitation.')
            }
          } else {
            setErrorMessage(
              'The invitation is either invalid or has already been expired.'
            )
          }
        } catch (error) {
          console.error('Token verification failed:', error)
          setErrorMessage(
            'There was an error verifying your invitation. Please try again.'
          )
        }
      }
    }

    validateToken()
  }, [invitationToken, verifyToken])

  const invitationController = async (action: string) => {
    try {
      const payload = {
        action: action,
        _id: verifiedData?.invitation?._id,
        userEmail: verifiedData?.invitation?.email,
        userName: verifiedData?.invitation?.name,
        role: verifiedData?.invitation?.role,
        extraAttr: verifiedData?.invitation?.extraAttr
      }
      await patchInvitationMutation.mutateAsync(payload)
      if (action === 'accept') {
        setIsAccepted(true)
      }
    } catch (error) {
      console.log(error)
      // setErrorMessage(
      //   'There was an error processing your invitation. Please try again.'
      // )
    }
  }
  return (
    <div className='flex min-h-screen items-center justify-center bg-primary-green'>
      <div className='w-1/2 rounded-lg bg-white p-8 py-20 text-center shadow-md'>
        <img
          src='/images/Logo.svg' // Update the image source as needed
          alt='Davaindia Logo'
          className='mx-auto mb-6 w-32'
        />
        <h2 className='mb-4 text-lg font-semibold text-gray-800'>
          You have been invited to join Davaindia
        </h2>

        {errorMessage ? (
          <div className='text-red-500'>{errorMessage}</div>
        ) : isAccepted ? (
          <div className='flex flex-col items-center gap-3'>
            <span className='text-sm'>Invitation accepted!</span>
            <div className='flex flex-col text-xs'>
              <span className='text-sm'>Credentials</span>
              <span>Email: {verifiedData?.invitation.email} </span>
              <span>Password: da@admin </span>
            </div>

            <Button
              variant='default'
              className='mt-4 w-36'
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center gap-3'>
            <Button
              variant='default'
              className='w-36'
              onClick={() => invitationController('accept')}
            >
              Accept Invitation
            </Button>
            <Button
              variant='outline'
              className='w-36'
              onClick={() => {
                invitationController('reject')
                router.push('/login')
              }}
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
