'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { useGetGptTranslation } from '@/utils/hooks/languageHooks'
import { Textarea } from '../ui/textarea'
import { useToast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'
const TiptapEditor = dynamic(() => import('../ui/TipTapEditor'), {
  ssr: false
})

export default function CategoryTranslationForm({
  formInstance: form,
  type,
  translationValues = [],
  translateType = undefined,
  formType = 'input',
  translationFor = '',
  disabled = false
}: {
  formInstance: UseFormReturn
  translationValues: []
  type: string
  translateType?: string | undefined
  formType?: 'input' | 'textarea' | 'richText'
  translationFor?: string
  disabled?: boolean
}) {
  const gptTranslation = useGetGptTranslation()
  const { toast } = useToast()

  const handleGetGptTranslations = async () => {
    try {
      const data = await gptTranslation.mutateAsync({
        text: form.getValues(type),
        translateType: translateType,
        translationFor
      })
      if (data?.translations && typeof data?.translations == 'object') {
        const translations = data.translations
        const currentTranslations = form.getValues(`translations.${type}`)
        for (const currentTranslation in currentTranslations) {
          if (!currentTranslations[currentTranslation]) {
            form.setValue(
              `translations.${type}.${currentTranslation}`,
              translations[currentTranslation]
                ? translations[currentTranslation]
                : ''
            )
          }
        }
      } else {
        toast({
          title: 'Something went wrong',
          description: 'Translation failed please try again'
        })
      }
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Translation failed please try again'
      })
      console.log(error)
    }
  }
  return (
    <div className='rounded-lg'>
      <div className='flex justify-center'>
        {!disabled && (
          <Button
            disabled={gptTranslation.isPending}
            className='inline'
            variant='outline'
            onClick={handleGetGptTranslations}
            type='button'
            size={'sm'}
          >
            {gptTranslation.isPending ? (
              <>
                <Loader2 className='inline animate-spin' />
                <span> Please wait</span>
              </>
            ) : (
              'Use ChatGPT for Translation'
            )}
          </Button>
        )}
      </div>
      <Form {...form}>
        <form
          className={`grid max-h-[485px] ${formType == 'input' ? 'grid-cols-2' : 'grid-cols-1'} gap-6 overflow-y-auto px-4 py-2`}
        >
          {formType == 'richText' ? (
            <FormField
              control={form.control}
              name={type}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English</FormLabel>
                  <FormControl>
                    <div className='cursor-not-allowed'>
                      <TiptapEditor
                        value={field.value}
                        onChange={() => {}}
                        readOnly
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name={type}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English</FormLabel>
                  <FormControl>
                    <Input placeholder='English' disabled {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          {translationValues?.map((key: any, index: number) => (
            <FormField
              key={index}
              control={form.control}
              name={`translations.${type}.${key?.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{key?.name}</FormLabel>
                  <FormControl>
                    {formType == 'input' ? (
                      <Input
                        placeholder='Write Translation'
                        {...field}
                        disabled={disabled}
                      />
                    ) : formType == 'textarea' ? (
                      <Textarea
                        placeholder='Write Translation'
                        {...field}
                        className='resize-none'
                        rows={4}
                        disabled={disabled}
                      />
                    ) : (
                      <TiptapEditor
                        value={field.value}
                        onChange={() => {}}
                        readOnly
                      />
                    )}
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </form>
      </Form>
    </div>
  )
}
