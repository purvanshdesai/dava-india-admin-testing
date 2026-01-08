import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface OrderDataset {
  startDate: string
  endDate: string
  week: string
  orders: number
}

export function OrdersChart({ orders }: { orders: OrderDataset[] }) {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart
        data={orders}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid
          strokeDasharray='3 3'
          className='stroke-muted'
          vertical={false}
        />
        <XAxis
          dataKey='week'
          className='fill-muted-foreground text-xs'
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          className='fill-muted-foreground text-xs'
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className='border p-2 shadow-sm'>
                  <p className='text-xs font-medium'>
                    Week {payload[0].payload.startDate} -{' '}
                    {payload[0].payload.endDate}
                  </p>
                  <p className='text-sm font-bold'>{payload[0].value} orders</p>
                </Card>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey='orders'
          fill='#ef6824'
          stroke='#ef6824'
          radius={[4, 4, 0, 0]}
          strokeWidth={1}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
