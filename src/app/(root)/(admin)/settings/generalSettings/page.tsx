'use client'

import GeneralSettings from '@/components/settings/GeneralSettings/GeneralSettings'
import { useFetchSettings } from '@/utils/hooks/settingsHooks'

export default function GeneralSettingsPage() {
  const { data, isPending } = useFetchSettings()

  if (isPending) return <div>Loading...</div>

  return <GeneralSettings initialData={data} />
}
