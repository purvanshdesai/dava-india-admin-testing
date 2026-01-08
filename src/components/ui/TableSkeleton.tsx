import { Skeleton } from './skeleton'

export default function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className='flex flex-col space-y-3'>
      <Skeleton className='h-10 w-full' />
      {Array.from({ length: rows }, (_, i) => i + 1).map((row: number) => (
        <Skeleton key={row} className='h-10 w-full' />
      ))}
    </div>
  )
}
