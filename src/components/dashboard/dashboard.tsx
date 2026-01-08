'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RevenueChart } from '@/components/dashboard/charts/revenue-chart'
import { SalesChart } from '@/components/dashboard/charts/sales-chart'
// import { ProductsChart } from '@/components/dashboard/charts/products-chart'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { TopProducts } from '@/components/dashboard/top-products'
import { ArrowUpRight, DollarSign, ShoppingBag, Users } from 'lucide-react'
import { OrdersChart } from './charts/orders-chart'
import { useFetchDashboardMetrics } from '@/utils/hooks/dashboardHooks'
import { DailyOrdersChart } from './charts/daily-orders-chart'
import { DashboardDateSelector } from './DateSelector'
import { useState } from 'react'

interface DashboardData {
  revenueStat: {
    currentMonth: number
    lastMonth: number
    difference: string
  }
  ordersStat: {
    currentMonth: number
    lastMonth: number
    difference: string
  }
  customersStat: {
    currentMonth: number
    lastMonth: number
    difference: string
  }
  yearRevenueReport: any[]
  weeklySales: any[]
  weeklyOrders: any[]
  recentOrders: any[]
  topSellingProducts: any[]
  dailyOrdersReport: any[]
}

export default function Dashboard() {
  const [currentDateProps, setCurrentDateProps] = useState({
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString()
  })
  const { data } = useFetchDashboardMetrics(currentDateProps)
  const dashboard: DashboardData = data

  return (
    <div className='flex flex-col gap-6 pb-12'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>

        <DashboardDateSelector onDateChange={v => setCurrentDateProps(v)} />
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Total Revenue
                </p>
                <h3 className='text-2xl font-bold'>
                  ₹
                  {dashboard?.revenueStat
                    ? dashboard?.revenueStat?.currentMonth.toFixed(2)
                    : '0.00'}
                </h3>
                <p className='text-muted-foreground mt-1 text-xs'>
                  <span
                    className={`inline-flex items-center ${dashboard?.revenueStat && dashboard?.revenueStat?.difference?.includes('-') ? 'text-red-600' : 'text-emerald-500'}`}
                  >
                    {dashboard?.revenueStat
                      ? dashboard?.revenueStat?.difference
                      : 0}
                    <ArrowUpRight className='ml-1 h-3 w-3' />
                  </span>{' '}
                  from last month
                </p>
              </div>
              <div className='rounded-full bg-primary/10 p-3'>
                <DollarSign className='h-5 w-5 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Total Orders
                </p>
                <h3 className='text-2xl font-bold'>
                  +
                  {dashboard?.ordersStat
                    ? dashboard?.ordersStat?.currentMonth
                    : 0}
                </h3>
                <p className='text-muted-foreground mt-1 text-xs'>
                  <span
                    className={`inline-flex items-center ${dashboard?.ordersStat && dashboard?.ordersStat?.difference?.includes('-') ? 'text-red-600' : 'text-emerald-500'}`}
                  >
                    {dashboard?.ordersStat
                      ? dashboard?.ordersStat?.difference
                      : 0}
                    <ArrowUpRight className='ml-1 h-3 w-3' />
                  </span>{' '}
                  from last month
                </p>
              </div>
              <div className='rounded-full bg-primary/10 p-3'>
                <ShoppingBag className='h-5 w-5 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  New Customers
                </p>
                <h3 className='text-2xl font-bold'>
                  +
                  {dashboard?.customersStat
                    ? dashboard?.customersStat?.currentMonth
                    : 0}
                </h3>
                <p className='text-muted-foreground mt-1 text-xs'>
                  <span
                    className={`inline-flex items-center ${dashboard?.customersStat && dashboard?.customersStat?.difference?.includes('-') ? 'text-red-600' : 'text-emerald-500'}`}
                  >
                    {dashboard?.customersStat
                      ? dashboard?.customersStat?.difference
                      : 0}
                    <ArrowUpRight className='ml-1 h-3 w-3' />
                  </span>{' '}
                  from last month
                </p>
              </div>
              <div className='rounded-full bg-primary/10 p-3'>
                <Users className='h-5 w-5 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Conversion Rate
                </p>
                <h3 className='text-2xl font-bold'>3.2%</h3>
                <p className='text-muted-foreground mt-1 text-xs'>
                  <span className='inline-flex items-center text-emerald-500'>
                    +1.1% <ArrowUpRight className='ml-1 h-3 w-3' />
                  </span>{' '}
                  from last month
                </p>
              </div>
              <div className='rounded-full bg-primary/10 p-3'>
                <ArrowUpRight className='h-5 w-5 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='reports'>Reports</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='lg:col-span-7'>
              <CardHeader>
                <CardTitle>Daily Orders Overview</CardTitle>
                <CardDescription>
                  Daily orders count for the current month
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[300px] px-0'>
                <DailyOrdersChart orders={dashboard?.dailyOrdersReport ?? []} />
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='lg:col-span-7'>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue for the current year
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[300px]'>
                <RevenueChart sales={dashboard?.yearRevenueReport ?? []} />
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Orders Overview</CardTitle>
                <CardDescription>
                  Weekly orders count for the current month
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[300px]'>
                <OrdersChart orders={dashboard?.weeklyOrders ?? []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Weekly sales for the current month
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[300px]'>
                <SalesChart sales={dashboard?.weeklySales ?? []} />
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-6'>
            <Card className='lg:col-span-3'>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Best selling products this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopProducts products={dashboard?.topSellingProducts ?? []} />
              </CardContent>
            </Card>

            <Card className='lg:col-span-3'>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders orders={dashboard?.recentOrders ?? []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>
                Sales distribution by product category
              </CardDescription>
            </CardHeader>
            <CardContent className='h-[400px]'>
              {/* <ProductsChart /> */}
              <p>Coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='reports'>
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and download reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
