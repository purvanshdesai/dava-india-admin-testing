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
  name: string
  revenue: number
}

export function RevenueChart({ sales }: { sales: Dataset[] }) {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <AreaChart
        data={sales}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis
          dataKey='name'
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
                    {payload[0].payload.name}
                  </p>
                  <p className='text-sm font-bold'>
                    ₹{Number(payload[0].value)?.toFixed(2)}
                  </p>
                </Card>
              )
            }
            return null
          }}
        />
        <Area
          type='monotone'
          dataKey='revenue'
          // stroke="hsl(var(--primary))"
          // fill="hsl(var(--primary) / 0.2)"
          fill='oklch(87% 0.065 274.039)'
          stroke='oklch(45.7% 0.24 277.023)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
