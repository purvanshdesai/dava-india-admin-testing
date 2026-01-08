'use client'
import CustomTabs from '@/components/products/CustomTabs'
import ProductOverview from '@/components/inventory/InventoryDetails/ProductOverview'
import StockAdjustment from '@/components/inventory/InventoryDetails/StockAdjustment'
import { useFetchInventoryById } from '@/utils/hooks/inventoryHooks'
import LoadingSpinner from '@/components/LoadingSpinner'
import SalesTable from '@/components/inventory/InventoryDetails/Sales'

export default function InventoryDetails({
  inventoryId
}: {
  inventoryId: string
}) {
  const { data, isLoading } = useFetchInventoryById(inventoryId)

  const tabs = [
    {
      name: 'Overview',
      value: 'overview',
      content: <ProductOverview details={data} />
    },
    {
      name: 'Sales',
      value: 'sales',
      content: <SalesTable inventoryDetails={data} />
    },
    {
      name: 'Adjust Stock',
      value: 'adjustStock',
      content: <StockAdjustment inventoryDetails={data} />
    }
  ]

  if (isLoading) return <LoadingSpinner />

  return <CustomTabs defaultValue={'overview'} tabs={tabs} />
}
