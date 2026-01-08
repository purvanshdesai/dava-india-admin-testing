import api from '@/lib/axios'

export const handleGetLanguages = async (query: any) => {
  try {
    const reqQuery: any = {
      $limit: query.$limit,
      $skip: query.$skip
    }
    if (query.filters?.length) {
      for (const filter of query.filters) {
        if (filter.id == 'text') {
          reqQuery[filter.id] = {
            $regex: filter.value,
            $options: 'i'
          }
        }
      }
    }
    const res = await api.get('/i18n-settings', {
      params: { ...reqQuery }
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const handleGetLanguage = async (id: string) => {
  try {
    const res = await api.get(`/i18n-settings/${id}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const handlePatchLanguage = async ({ data, id }: any) => {
  try {
    console.log('payload trans ', data)
    const res = await api.patch(`/i18n-settings/${id}`, { translations: data })
    return res.data
  } catch (error) {
    throw error
  }
}

export const chatGptTranslation = async ({
  text,
  translateType = undefined,
  translationFor = ''
}: {
  text: string
  translateType?: string | undefined
  translationFor?: string
}): Promise<any> => {
  try {
    const res = await api.post('/chatgpt-translation', {
      text,
      translateType,
      translationFor
    })
    return res.data
  } catch (error) {
    throw error
  }
}
