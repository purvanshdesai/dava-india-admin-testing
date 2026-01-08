'use client'
import { TabsTriggerCustom } from '@/components/custom/TabsTigger'
import KeywordInfoForm from '@/components/settings/language/KeywordInfoForm'
import TranslationForm from '@/components/settings/language/TranslationForm'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { useFooter } from '@/context/Footer'
import { keywordTranslationForm, translationFormSchema } from '@/lib/zod'
import { useGetSupportedLanguages } from '@/utils/hooks/appDataHooks'
import { useGetLanguage, usePatchLanguage } from '@/utils/hooks/languageHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import AppBreadcrumb from '@/components/Breadcrumb'

const formatTranslation = (languages: any[], translation: any) => {
  const translations = { ...translation.translations }
  for (const lang of languages) {
    if (lang?.code && !translations[lang?.code]) {
      translations[lang?.code] = {
        text: '',
        language: lang?.name,
        name: `translations.${lang?.code}.text`
      }
    } else if (lang?.code) {
      translations[lang?.code] = {
        ...translations[lang?.code],
        language: lang?.name,
        name: `translations.${lang?.code}.text`
      }
    }
  }
  return translations
}

const Footer = ({
  onSubmit,
  onBack,
  loading
}: {
  onSubmit: () => void
  onBack: () => void
  loading: any
}) => {
  return (
    <div className={'flex h-full items-center justify-end gap-4 px-5'}>
      <Button
        className={
          'w-24 border border-orange-500 bg-white text-center text-orange-500'
        }
        onClick={onBack}
      >
        Cancel
      </Button>
      <Button
        className={'w-24 text-center'}
        loader={loading}
        onClick={onSubmit}
      >
        Save
      </Button>
    </div>
  )
}

export default function LanguageView({
  params
}: {
  params: { languageId: string }
}) {
  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const { data: languages, isLoading: categoriesLoading } =
    useGetSupportedLanguages({})

  const language = useGetLanguage(params.languageId)

  const languagePatchMutation = usePatchLanguage()

  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const { setFooterContent } = useFooter() as any

  const keywordForm = useForm<z.infer<typeof keywordTranslationForm>>({
    resolver: zodResolver(keywordTranslationForm),
    values: {
      keyword: language.data?.lookup_key || '',
      group: language.data?.groups || ''
    }
  })
  const translationForm = useForm<z.infer<typeof translationFormSchema>>({
    resolver: zodResolver(translationFormSchema),
    values: {
      keyword: language.data?.lookup_key || '',
      english: language.data?.text || '',
      translations:
        categoriesLoading || language.isLoading
          ? {}
          : formatTranslation(languages, language.data)
    }
  })

  const handleTranslationSubmit = async (data: any) => {
    try {
      setLoading(true)
      await languagePatchMutation.mutateAsync({
        data: data?.translations,
        id: params.languageId
      })
      router.push(`/settings/language?page=${page || 0}&limit=${limit || 0}`)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }
  const cancelPress = () => {
    router.push(`/settings/language?page=${page || 0}&limit=${limit || 0}`)
  }

  useEffect(() => {
    setFooterContent(
      <Footer
        loading={loading}
        onSubmit={translationForm.handleSubmit(handleTranslationSubmit)}
        onBack={cancelPress}
      />
    )
    return () => {
      setFooterContent(null)
    }
  }, [loading, translationForm])

  if (categoriesLoading || language.isLoading) {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    )
  }

  return (
    <div className='relative max-h-fit min-h-full pb-14'>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Settings', href: '/settings' },
            {
              page: 'Language Translations',
              href: `/settings/language?page=${page || 0}&limit=${limit || 0}`
            },
            {
              page: language ? language?.data?.lookup_key : ''
            }
          ]}
        />
      </div>

      <div className='p-6'>
        <Tabs defaultValue='keyword'>
          <TabsList className='bg-inherit'>
            <TabsTriggerCustom value='keyword'>
              Keyword Information
            </TabsTriggerCustom>
            <TabsTriggerCustom value='translation'>
              Translations
            </TabsTriggerCustom>
          </TabsList>
          <TabsContent value='keyword'>
            <div className='mt-6 w-[40%]'>
              <KeywordInfoForm form={keywordForm} />
            </div>
          </TabsContent>
          <TabsContent value='translation'>
            <div className='mt-6 w-[40%]'>
              <TranslationForm form={translationForm} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
