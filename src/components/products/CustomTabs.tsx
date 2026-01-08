import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CustomTabs = ({ tabs, ...props }: any) => {
  return (
    <Tabs {...props} className='w-full'>
      <TabsList
        className={
          'h-11 w-full justify-start rounded-none border-b-2 border-[#E0E0E0] bg-white p-0'
        }
      >
        {tabs.map((tab: any) => (
          <TabsTrigger
            disabled={tab.disabled}
            key={tab.value}
            className='mr-5 px-0 py-3 shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 data-[state=active]:shadow-none'
            value={tab.value}
          >
            {tab.icon}
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab: any) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          forceMount={true}
          className='data-[state=inactive]:hidden'
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default CustomTabs
