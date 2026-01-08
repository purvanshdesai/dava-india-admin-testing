import React from 'react'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { TabsTriggerCustom } from '@/components/custom/TabsTigger'
import TaxesTable from '@/components/Taxes/Table'
import DefaultTax from '@/components/Taxes/defaultTax'

const TaxesList = () => {
  return (
    <div>
      <Tabs defaultValue='taxRates'>
        <TabsList className='bg-inherit'>
          <TabsTriggerCustom value='taxRates'>Taxes Rates</TabsTriggerCustom>
          <TabsTriggerCustom value='defaultTax'>Default Tax</TabsTriggerCustom>
        </TabsList>

        <TabsContent value='taxRates'>
          <div className='mt-6'>
            <TaxesTable />
          </div>
        </TabsContent>
        <TabsContent value='defaultTax'>
          <div className='mt-6 w-[40%]'>
            <DefaultTax />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TaxesList
