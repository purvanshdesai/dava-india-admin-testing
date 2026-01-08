import { Card } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface Dataset {
  date: string
  orders: number
}

export function DailyOrdersChart({ orders }: { orders: Dataset[] }) {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <AreaChart
        data={orders}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis
          dataKey='date'
          className='fill-muted-foreground text-xs'
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          className='fill-muted-foreground text-xs'
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `₹${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className='border p-2 shadow-sm'>
                  <p className='text-sm font-medium'>
                    Date: {payload[0].payload.date}
                  </p>
                  <p className='text-sm font-bold'>
                    Count: {payload[0].payload.orders}
                  </p>
                </Card>
              )
            }
            return null
          }}
        />
        <Area
          type='monotone'
          dataKey='orders'
          // stroke="hsl(var(--primary))"
          // fill="hsl(var(--primary) / 0.2)"
          fill='#FFE3D4'
          stroke='#ef6824'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
