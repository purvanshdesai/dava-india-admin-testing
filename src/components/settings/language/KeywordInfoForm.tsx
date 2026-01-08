'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { keywordTranslationForm } from '@/lib/zod'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

export default function KeywordInfoForm({
  form
}: {
  form: UseFormReturn<z.infer<typeof keywordTranslationForm>>
}) {
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
                  <Input placeholder='keyword' {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='group'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
                <FormControl>
                  <Input placeholder='Group' {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}
