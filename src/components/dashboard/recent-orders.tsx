import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface OrderDataset {
  _id: string
  orderId: string
  createdAt: string
  orderTotal: number
  status: 'pending' | 'paid' | 'failed'
  customer: {
    id: string
    name: string
    email: string
  }
}

export function RecentOrders({ orders }: { orders: Array<OrderDataset> }) {
  const router = useRouter()
  return (
    <div className='space-y-3'>
      {orders.map(order => (
        <div
          key={order.orderId}
          className='bg-card text-card-foreground flex cursor-pointer items-center justify-between rounded-lg border p-4 shadow-sm'
          onClick={() => {
            router.push(`orders/${order._id}?page=0&limit=10`)
          }}
        >
          <div className='flex items-center gap-4'>
            <Avatar>
              <AvatarImage src={'/images/Profile.svg'} />
              <AvatarFallback>{order.customer.name}</AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium'>{order.customer.name}</p>
              <p className='text-muted-foreground text-xs'>
                {order.customer.email}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <p className='text-sm font-medium'>{order.orderId}</p>
              <p className='text-muted-foreground text-xs'>{order.createdAt}</p>
            </div>
            <div className='text-right'>
              <p className='text-sm font-medium'>₹{order.orderTotal}</p>
              <Badge
                variant='outline'
                className={cn(
                  'text-xs',
                  order.status === 'paid' &&
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400',
                  order.status === 'failed' &&
                    'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400',
                  order.status === 'pending' &&
                    'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400'
                )}
              >
                {order.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
