'use client'
import AppBreadcrumb from '@/components/Breadcrumb'
import { TabsTriggerCustom } from '@/components/custom/TabsTigger'
import { LogisticsColumn } from '@/components/logistics/CouriersColumns'
import { ZoneColumn } from '@/components/logistics/ZoneColumns'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/DataTable/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import React, { useState } from 'react'
import {
  useAddCouriersToLogisticsRule,
  useAddDeliveryZonesToLogisticsRule,
  useFetchLogisticsRuleById,
  useFetchLogisticsRuleCouriers,
  useFetchLogisticsRuleDeliveryZones
} from '@/utils/hooks/logisticsHooks'
import { useParams } from 'next/navigation'
import DeliveryZonesDialogContent from '@/components/logistics/DeliveryZonesDialogContent'
import AddCourierDialogContent from '@/components/logistics/AddCourierDialogContent'
import { Label } from '@/components/ui/label'

export default function LogisticsEdit() {
  const params = useParams<{ logisticsId: string }>()
  const [paginationDeliveryZones, setPaginationDeliveryZones] = useState<
    PaginationState & { _key?: number }
  >({
    pageIndex: 0,
    pageSize: 10,
    _key: 0
  })
  const [paginationCouriers, setPaginationCouriers] = useState<
    PaginationState & { _key?: number }
  >({
    pageIndex: 0,
    pageSize: 10,
    _key: 0
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { data: rule } = useFetchLogisticsRuleById(params.logisticsId)
  const { data: ruleDeliveryZones, isPending: isPendingDeliveryZones } =
    useFetchLogisticsRuleDeliveryZones({
      ruleId: params.logisticsId,
      skip:
        paginationDeliveryZones.pageIndex * paginationDeliveryZones.pageSize,
      limit: paginationDeliveryZones.pageSize
    })
  const { data: ruleCouriers, isPending: isPendingCouriers } =
    useFetchLogisticsRuleCouriers({
      ruleId: params.logisticsId,
      skip: paginationCouriers.pageIndex * paginationCouriers.pageSize,
      limit: paginationCouriers.pageSize
    })
  const { mutateAsync } = useAddDeliveryZonesToLogisticsRule()
  const { mutateAsync: addCouriersMutation } = useAddCouriersToLogisticsRule()

  const addDeliveryZones = async (deliveryZones: string[]) => {
    console.log('to be added --- ', deliveryZones)
    await mutateAsync({
      deliveryPolicyId: deliveryZones,
      ruleId: params.logisticsId
    })
  }

  const addCouriers = async (
    deliveryMode: string,
    partner: string,
    couriers: any[],
    packageSize: 'small' | 'big'
  ) => {
    await addCouriersMutation({
      ruleId: params.logisticsId,
      couriers: couriers.map(c => ({
        partner,
        partnerCourierId: c,
        deliveryMode
      })),
      packageSize
    })
  }

  if (isPendingCouriers || isPendingDeliveryZones) return <div>Loading...</div>

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Logistics', href: '/logistics' },
            {
              page:
                params.logisticsId === 'new'
                  ? 'Add new logistics'
                  : rule.ruleName
            }
          ]}
        />
      </div>
      <div className='p-9'>
        <div className='grid w-full max-w-sm items-center gap-1.5'>
          <Label>{rule.ruleName}</Label>
        </div>
        <div className='mt-5'>
          <Tabs defaultValue='couriers'>
            <TabsList className='bg-inherit'>
              <TabsTriggerCustom value='couriers'>Couriers</TabsTriggerCustom>
              <TabsTriggerCustom value='deliveryZones'>
                Delivery Zones
              </TabsTriggerCustom>
            </TabsList>
            <TabsContent value='couriers'>
              <div className='mt-6'>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className='flex justify-between py-3'>
                      <Button>Add New Courier</Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent className='h-5/6 sm:max-w-[600px]'>
                    <DialogHeader>
                      <DialogTitle>Add New Courier</DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div className={'overflow-y-scroll p-2'}>
                      <AddCourierDialogContent
                        ruleCouriers={ruleCouriers?.data?.map(
                          (c: any) => c.partnerCourierId
                        )}
                        setRuleCouriers={(
                          deliveryMode: string,
                          partner: string,
                          couriers: any[],
                          packageSize: 'small' | 'big'
                        ) =>
                          addCouriers(
                            deliveryMode,
                            partner,
                            couriers,
                            packageSize
                          )
                        }
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <div className='mt-3'>
                  <DataTable
                    data={ruleCouriers?.data || []}
                    totalRows={ruleCouriers?.total || 0}
                    pagination={paginationCouriers}
                    setPagination={setPaginationCouriers}
                    setColumnFilters={setColumnFilters}
                    columns={LogisticsColumn}
                    columnFilters={columnFilters}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value='deliveryZones'>
              <div className='mt-6'>
                <Dialog>
                  <DialogTrigger asChild>
                    {/* <div className='flex justify-between py-3'> */}
                    <Button>Add New Zone</Button>
                    {/* </div> */}
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[600px]'>
                    <DialogHeader>
                      <DialogTitle>Add New Delivery Zone</DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <DeliveryZonesDialogContent
                      ruleDeliveryZones={ruleDeliveryZones?.data?.map(
                        (rdz: any) => rdz._id
                      )}
                      setRuleDeliveryZones={async newZoneIds => {
                        await addDeliveryZones(newZoneIds)
                      }}
                    />
                  </DialogContent>
                </Dialog>

                {(ruleDeliveryZones?.errors ?? [])?.length > 0 && (
                  <div className='py-4'>
                    <p className='font-semibold text-red-600'>Errors</p>

                    <div>
                      {(ruleDeliveryZones?.errors ?? []).map(
                        (error: any, idx: number) => {
                          return (
                            <div key={idx} className='py-1 text-sm'>
                              <span className='font-semibold'>
                                {error.deliveryZone}
                              </span>{' '}
                              - {error.error}
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                )}

                <div className='mt-3'>
                  <DataTable
                    data={ruleDeliveryZones?.data || []}
                    totalRows={ruleDeliveryZones?.total || 0}
                    pagination={paginationDeliveryZones}
                    setPagination={setPaginationDeliveryZones}
                    setColumnFilters={setColumnFilters}
                    columns={ZoneColumn}
                    columnFilters={columnFilters}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
