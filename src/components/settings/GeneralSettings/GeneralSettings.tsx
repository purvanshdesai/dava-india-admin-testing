'use client'

import CustomTabs from '@/components/products/CustomTabs'
import { useEffect, useState } from 'react'
import AppBreadcrumb from '@/components/Breadcrumb'
import CartPays from '@/components/settings/GeneralSettings/CartPays'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { generalSettings } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { useFooter } from '@/context/Footer'
import GeneralSettingsFooter from '@/components/settings/GeneralSettings/Footer'
import { useUpdateSettings } from '@/utils/hooks/settingsHooks'
import { useToast } from '@/hooks/use-toast'

export default function GeneralSettings({ initialData }: any) {
  const { setFooterContent } = useFooter()
  const { mutate: updateSettings } = useUpdateSettings()
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState<string>('cartPays')

  async function onSubmit(values: z.infer<typeof generalSettings>) {
    try {
      const settings = transformSettingsFromFormData(values)
      updateSettings({ settings })
      toast({ title: 'Success', description: 'Settings saved successfully' })
    } catch (error) {
      console.log(error)
      toast({ title: 'Error', description: 'Could not save settings' })
    } finally {
    }
  }

  const onError = (errors: any) => {
    const fields = Object.keys(errors)
    if (fields.length) {
      const field = fields[0]
      for (const tab of tabs) {
        if (tab.fields.includes(field)) {
          setCurrentTab(tab.value)
          break
        }
      }
    }
  }

  const transformSettingsFromFormData = (
    formData: z.infer<typeof generalSettings>
  ) => {
    const settings = []
    const c = getCartPaysSettingsFromFormData(formData)
    settings.push(...c)
    return settings
  }

  const transformSettingsToFormData = (settings: any) => {
    return {
      ...createCartPaysSettingsForFormData(settings)
    }
  }

  const createCartPaysSettingsForFormData = (settings: any) => {
    const cartPaysFormData: any = {}
    for (const setting of settings) {
      const { settingCategory, settingType, value } = setting
      if (
        settingCategory === 'general' &&
        ['handlingCharge', 'packingCharge', 'platformFee'].includes(settingType)
      ) {
        cartPaysFormData[settingType] = value[settingType]
        cartPaysFormData[`${settingType}Applicable`] = value.applicable
      }
    }
    return cartPaysFormData
  }

  const getCartPaysSettingsFromFormData = (
    formData: z.infer<typeof generalSettings>
  ) => {
    const cartPaysSettings: any[] = []

    cartPaysSettings.push({
      settingType: 'handlingCharge',
      settingCategory: 'general',
      value: {
        applicable: formData.handlingChargeApplicable,
        handlingCharge: formData.handlingCharge
      }
    })
    cartPaysSettings.push({
      settingType: 'packingCharge',
      settingCategory: 'general',
      value: {
        applicable: formData.packingChargeApplicable,
        packingCharge: formData.packingCharge
      }
    })
    cartPaysSettings.push({
      settingType: 'platformFee',
      settingCategory: 'general',
      value: {
        applicable: formData.platformFeeApplicable,
        platformFee: formData.platformFee
      }
    })
    return cartPaysSettings
  }

  const form = useForm<z.infer<typeof generalSettings>>({
    resolver: zodResolver(generalSettings),
    defaultValues: initialData
      ? transformSettingsToFormData(initialData)
      : {
          handlingChargeApplicable: false,
          handlingCharge: 0,
          packingChargeApplicable: false,
          packingCharge: 0,
          platformFeeApplicable: false,
          platformFee: 0
        }
  })

  const tabs: any[] = [
    {
      name: 'Cart Pays',
      value: 'cartPays',
      content: <CartPays form={form as unknown as UseFormReturn} />,
      fields: [
        'handlingChargeApplicable',
        'handlingCharge',
        'packingChargeApplicable',
        'packingCharge',
        'platformFeeApplicable',
        'platformFee'
      ]
    }
  ]

  useEffect(() => {
    setFooterContent(
      <GeneralSettingsFooter
        loading={false}
        form={form as unknown as UseFormReturn}
        onSubmit={onSubmit as (values: unknown) => void}
        onError={onError as (values: unknown) => void}
      />
    )

    return () => {
      setFooterContent(null)
    }
  }, [form])

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Settings', href: '/settings' },
            { page: 'General Settings' }
          ]}
        />
      </div>
      <div className={'my-2'}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <CustomTabs
              defaultValue={'cartPays'}
              on
              tabs={tabs}
              value={currentTab}
              onValueChange={(tab: string) => setCurrentTab(tab)}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
