import React from 'react'

type Props = {
  children: string | JSX.Element | JSX.Element[]
  status: any
  label: string
  hasLastNode?: boolean
  comment?: string
  date?: any
  author?: string
  transferredByStore?: string
  userType?: 'super-admin' | 'store-admin' | undefined
}

export default function ProgressStepper({
  children,
  label,
  hasLastNode = false,
  comment,
  date,
  author,
  userType,
  transferredByStore
}: Props) {
  return (
    <div className=''>
      <div className='flex items-start space-x-4'>
        <div className='relative flex flex-col items-center'>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
              label !== 'Processing'
                ? 'border-[#FFE3D4] bg-[#FFE3D4]'
                : 'border-gray-300 bg-white'
            }`}
          >
            {children}
          </div>
          {!hasLastNode && <div className='h-16 w-[2px] bg-gray-300'></div>}
        </div>

        <div className='relative flex-grow text-sm'>
          <div className='ml-3'>
            <p className='font-semibold'>{label}</p>
            <div className='flex items-center py-2 font-medium text-gray-500'>
              <p className='text-xs font-medium italic'>
                {date} by {author}{' '}
                {userType &&
                  (userType === 'super-admin'
                    ? '(Super Admin)'
                    : '(Store Admin)')}
              </p>
            </div>
            <p className='pt-2 font-medium text-label'>{comment}</p>
            {transferredByStore && (
              <p className='font-medium'>
                Transferred from - {transferredByStore}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
