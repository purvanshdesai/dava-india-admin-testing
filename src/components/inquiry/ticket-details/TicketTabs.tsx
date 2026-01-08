import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TicketTabs = ({ tabs, ...props }: any) => {
  return (
    <Tabs {...props} className='w-full'>
      <TabsList
        className={'h-10 w-full justify-around rounded-none bg-[#F9FBFD] p-0'}
      >
        {tabs.map((tab: any) => (
          <TabsTrigger
            disabled={tab.disabled}
            key={tab.value}
            className='flex w-full items-center gap-2 border-b border-[#E0E0E0] px-0 py-3 shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 data-[state=active]:shadow-none'
            value={tab.value}
          >
            {tab.icon}
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      <div
        style={{ height: 'calc(100vh - 290px)' }}
        className={'overflow-y-auto'}
      >
        {tabs.map((tab: any) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            forceMount={true}
            className='h-full data-[state=inactive]:hidden'
          >
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

export default TicketTabs
