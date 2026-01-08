'use client'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'

const Footer = ({
  onSubmit,
  onBack,
  submitting = false
}: {
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}) => {
  return (
    <div className={'flex h-full items-center justify-end gap-4 px-5'}>
      <Button
        className={
          'w-24 border border-orange-500 bg-white text-center text-orange-500'
        }
        onClick={onBack}
      >
        Cancel
      </Button>
      <Button
        disabled={submitting}
        className={'w-24 text-center'}
        onClick={onSubmit}
      >
        {submitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
        Save
      </Button>
    </div>
  )
}

export default Footer
