'use client'
import InventoryDetails from '@/components/inventory/InventoryDetails/InventoryDetails'
import { useParams } from 'next/navigation'

export default function InventoryDetailsPage() {
  const params = useParams<{ inventoryId: string }>()
  return <InventoryDetails inventoryId={params.inventoryId} />
}
