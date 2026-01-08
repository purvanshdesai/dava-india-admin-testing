import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

const LoadingSpinner = ({ className }: { className?: ClassValue }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='64'
        height='64'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={cn('animate-spin', className)}
      >
        <path d='M21 12a9 9 0 1 1-6.219-8.56' />
      </svg>
    </div>
  )
}
export default LoadingSpinner
