import api from '@/lib/axios'

export async function updateSettings(data: {
  settings: {
    settingType: string
    settingCategory: string
    value: Record<string, any>
  }[]
}) {
  const res = await api.post(`/settings`, data)
  return res.data
}

export async function getSettings() {
  const res = await api.get(`/settings`)
  return res.data
}
