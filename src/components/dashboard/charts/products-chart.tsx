import { Card } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'

const data = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Home & Kitchen', value: 200 },
  { name: 'Books', value: 150 },
  { name: 'Beauty', value: 100 }
]

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.2)'
]

export function ProductsChart() {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          outerRadius={120}
          fill='#8884d8'
          dataKey='value'
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className='border p-2 shadow-sm'>
                  <p className='text-sm font-medium'>{payload[0].name}</p>
                  <p className='text-sm font-bold'>${payload[0].value}</p>
                </Card>
              )
            }
            return null
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
