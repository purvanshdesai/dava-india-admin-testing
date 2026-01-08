'use client'
import React from 'react'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import ChangeStore from '../orders/ChangeStore'
import { Button } from '../ui/button'
import { FilePenLineIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  useStoreAdminPartialOrderTransfer,
  useSuperAdminPartialOrderTransfer
} from '@/utils/actions/changeStore'
import { useQueryClient } from '@tanstack/react-query'
import { useChangeStoreSuperAdmin } from '@/utils/hooks/changeStoreSuperAdmin'
import { useChangeStore } from '@/utils/hooks/changeStore'
import { useRouter } from 'next/navigation'

export default function ChangeStoreDialog({
  order,
  storeTracking,
  refreshData
}: any) {
  const router = useRouter()

  const queryClient = useQueryClient()
  const { data: session } = useSession()

  const superAdminChangeStoreMutation = useChangeStoreSuperAdmin()
  const storeAdminChangeStoreMutation = useChangeStore()
  const superAdminPartialOrderTransferMutation =
    useSuperAdminPartialOrderTransfer()
  const storeAdminPartialOrderTransferMutation =
    useStoreAdminPartialOrderTransfer()

  const handleStoreChange = async (
    transferredStoreId: string,
    currentStoreId: string,
    cancelReason: string,
    comment: any,
    transferType?: string,
    selectedProducts?: any[]
  ) => {
    try {
      const { user } = session ?? {}
      if (!user) return

      const isSuperAdmin = user?.role === 'super-admin'

      // Handle partial transfer for super admin
      if (transferType === 'partial' && selectedProducts) {
        if (isSuperAdmin) {
          await superAdminPartialOrderTransferMutation.mutateAsync({
            transferredStoreId,
            currentStoreId,
            orderId: order?._id,
            selectedProducts,
            cancelReason,
            comment
          })
        } else {
          await storeAdminPartialOrderTransferMutation.mutateAsync({
            transferredStoreId,
            currentStoreId,
            orderId: order?._id,
            selectedProducts,
            cancelReason,
            comment
          })
        }
      } else {
        // Handle full transfer
        const mutationFn = !isSuperAdmin
          ? storeAdminChangeStoreMutation?.mutateAsync
          : superAdminChangeStoreMutation?.mutateAsync

        await mutationFn({
          orderId: order?._id,
          transferredStoreId,
          currentStoreId,
          cancelReason,
          comment
        })
      }

      // Improved cache invalidation for partial transfers
      if (transferType === 'partial') {
        // Invalidate all order-related queries
        await queryClient.invalidateQueries({ queryKey: ['get-orders'] })
        await queryClient.invalidateQueries({
          queryKey: ['get-store-admin-orders']
        })
        await queryClient.invalidateQueries({
          queryKey: ['get-order-tracking']
        })

        // Force refresh the current order data
        await queryClient.refetchQueries({
          queryKey: isSuperAdmin
            ? ['get-orders', order?._id]
            : ['get-store-admin-orders', order?._id]
        })
      } else {
        queryClient.invalidateQueries({ queryKey: ['get-orders'] })
      }

      if (isSuperAdmin) refreshData()
      else router.push('/store/orders')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            disabled={storeTracking?.timeline?.find(
              (t: any) => t.statusCode === 'dispatched'
            )}
          >
            <FilePenLineIcon className='mr-2' />
            Change store
          </Button>
        </DialogTrigger>
        <DialogContent>
          <ChangeStore
            order={order}
            storeId={storeTracking?.store?._id}
            onStoreChange={(
              selectedStoreId,
              cancelReason,
              comment,
              transferType,
              selectedProducts
            ) =>
              handleStoreChange(
                selectedStoreId,
                storeTracking?.store?._id,
                cancelReason,
                comment,
                transferType,
                selectedProducts
              )
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
