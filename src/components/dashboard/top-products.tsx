import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'

interface ProductDataset {
  productId: string
  name: string
  description: string
  sales: number
  percentage: number
}

export function TopProducts({ products }: { products: ProductDataset[] }) {
  const router = useRouter()
  return (
    <div className='space-y-6'>
      {products.map(product => (
        <div
          key={product.name}
          className='cursor-pointer space-y-2'
          onClick={() => {
            router.push(`products/${product.productId}?page=0&limit=10`)
          }}
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>{product.name}</p>
              <p className='text-muted-foreground text-xs'>
                {product.description}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm font-medium'>{product.sales}</p>
              <p className='text-muted-foreground text-xs'>units sold</p>
            </div>
          </div>
          <Progress value={product.percentage} className='h-2' />
        </div>
      ))}
    </div>
  )
}
