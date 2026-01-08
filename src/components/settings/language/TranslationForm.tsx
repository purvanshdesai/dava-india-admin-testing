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
import { z } from 'zod'
import { translationFormSchema } from '@/lib/zod'
import { Button } from '@/components/ui/button'
import { useGetGptTranslation } from '@/utils/hooks/languageHooks'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function TranslationForm({
  form
}: {
  form: UseFormReturn<z.infer<typeof translationFormSchema>>
}) {
  const gptTranslation = useGetGptTranslation()
  const [translationDone, setTranslationDone] = useState(false)
  const dialogClose = useRef<any>(null)
  const { toast } = useToast()

  const handleGetGptTranslations = async () => {
    try {
      setTranslationDone(false)
      const currentTranslations = form.getValues('translations')
      const data = await gptTranslation.mutateAsync({
        text: form.getValues('english')
      })
      if (data?.translations) {
        const translations = data.translations
        for (const translation in translations) {
          if (
            currentTranslations[translation] &&
            !currentTranslations[translation]?.text
          ) {
            currentTranslations[translation].text = translations[translation]
          }
        }
        form.setValue('translations', { ...currentTranslations })
        setTranslationDone(true)
        setTimeout(() => {
          dialogClose.current?.click()
          setTranslationDone(false)
        }, 1000)
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
      dialogClose.current?.click()
      console.log(error)
    }
  }
  const translationValues = form.getValues().translations
  return (
    <div>
      <Form {...form}>
        <form className='flex flex-col gap-6'>
          <FormField
            control={form.control}
            name='keyword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keyword</FormLabel>
                <FormControl>
                  <Input placeholder='keyword' disabled {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Dialog>
            <DialogTrigger>
              <Button
                disabled={gptTranslation.isPending}
                className='inline'
                variant='outline'
                onClick={handleGetGptTranslations}
                type='button'
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
            </DialogTrigger>
            <DialogContent className='h-[250px] sm:max-w-[646px]'>
              <div className='flex h-full w-full flex-col items-center justify-center gap-2'>
                {translationDone ? (
                  <div className='flex flex-col items-center justify-center gap-3'>
                    <Image
                      src={'/images/roundCorrect.svg'}
                      width={95}
                      height={95}
                      alt=''
                    />
                    <h1 className='font-bold'>Translation Completed </h1>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center gap-3'>
                    <Image
                      src={'/images/translations.svg'}
                      width={95}
                      height={95}
                      alt=''
                    />
                    <h1 className='font-bold'>
                      Wait for the completion of keyword translation{' '}
                    </h1>
                  </div>
                )}
              </div>
              <DialogClose asChild>
                <div ref={dialogClose}></div>
              </DialogClose>
            </DialogContent>
          </Dialog>
          {/* <Button
            disabled={gptTranslation.isPending}
            className='inline'
            variant='outline'
            onClick={handleGetGptTranslations}
            type='button'
          >
            {gptTranslation.isPending ? (
              <>
                <Loader2 className='inline animate-spin' />
                <span> Please wait</span>
              </>
            ) : (
              'Use ChatGPT for Translation'
            )}
          </Button> */}
          <FormField
            control={form.control}
            name='english'
            render={({ field }) => (
              <FormItem>
                <FormLabel>English</FormLabel>
                <FormControl>
                  <Input placeholder='English' disabled {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          {/* {JSON.stringify(translationValues, null, 2)} */}
          {Object?.keys(translationValues)?.map(
            (key: string, index: number) => (
              <div key={index}>
                {key != 'en' ? (
                  <FormField
                    key={key}
                    control={form.control}
                    name={translationValues[key]?.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {translationValues[key]?.language}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='Write Translation' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>
            )
          )}
        </form>
      </Form>
    </div>
  )
}
