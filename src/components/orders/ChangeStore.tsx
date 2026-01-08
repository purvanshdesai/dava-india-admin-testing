'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import { useGetStoresForChange } from '@/utils/hooks/changeStore'
import { useGetSuperAdminStoresForChange } from '@/utils/hooks/changeStoreSuperAdmin'
import ChangeStoreModal from './ChangeStoreModal'

export default function ChangeStore({
  order,
  storeId,
  onStoreChange
}: {
  order: any
  storeId: string
  onStoreChange: (
    storeId: string,
    cancelReason: any,
    comment: any,
    transferType?: string,
    selectedProducts?: any[]
  ) => void
}) {
  const { data: session } = useSession()
  const { user } = session ?? {}
  if (!user) return <></>

  const fetchQuery =
    user?.role === 'store-admin'
      ? useGetStoresForChange(order?._id)
      : useGetSuperAdminStoresForChange(storeId, order._id)

  // TODO:// Check repetive call
  const { data: stores, isFetching } = fetchQuery

  if (isFetching) return <></>

  return (
    <ChangeStoreModal
      onChangeStore={(
        selectedStoreId,
        cancelReason,
        comment,
        transferType,
        selectedProducts
      ) => {
        onStoreChange(
          selectedStoreId,
          cancelReason,
          comment,
          transferType,
          selectedProducts
        )
      }}
      stores={stores}
      order={order}
    />
  )
}
