'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form } from '../ui/form'
import { Button } from '../ui/button'
import { formSchema } from '@/lib/zod'
import { z } from 'zod'
import FormSelectField from '../form/FormSelectField'
import { useAllTaxes, useSubmitDefaultTax } from '@/utils/hooks/taxesHooks'
import { useSession } from 'next-auth/react'
import dayjs from 'dayjs'
import { useToast } from '@/hooks/use-toast'
import {
  handleGetAllDefaultTaxes,
  handleUpdateDefault
} from '@/utils/actions/taxesActions'

const DefaultTax = () => {
  const { data: session } = useSession()
  const [pagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [columnFilters] = useState<any>([])
  const [defaultTaxId, setDefaultTaxId] = useState('')
  const { data: taxes }: any = useAllTaxes({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: columnFilters
  })
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()
  const userId = session?.user.id
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      taxId: ''
    }
  })
  const handleSubmitTax = useSubmitDefaultTax()

  // useSubmitDefaultTax
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      if (defaultTaxId) {
        const payload = {
          defaultTax: {
            taxId: data.taxId,
            date: dayjs().format('YYYY-MM-DD HH:mm:ss')
          },
          updatedBy: userId
        }
        await handleUpdateDefault({
          id: defaultTaxId,
          data: payload
        })
        toast({
          title: 'Success',
          description: 'Updated successfully'
        })
      } else {
        const payload = {
          defaultTax: {
            taxId: data.taxId,
            date: dayjs().format('YYYY-MM-DD HH:mm:ss')
          },
          createdBy: userId
        }
        await handleSubmitTax.mutateAsync(payload)
        toast({
          title: 'Success',
          description: 'Added successfully'
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const fetch = async () => {
    const response: any = await handleGetAllDefaultTaxes()
    console.log('response', response.data[0]?.defaultTax?.taxId)
    setDefaultTaxId(response.data[0]?._id)
    form.reset(response.data[0]?.defaultTax)
  }
  useEffect(() => {
    fetch()
  }, [])

  return (
    <div>
      <div className='p-5'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormSelectField
              isSmall={true}
              isReq={true}
              label={'Default Tax'}
              name={'taxId'}
              items={taxes?.data?.map((tax: any) => ({
                value: tax._id,
                label: tax.name
              }))}
              className={'w-full'}
            />
            <Button type='submit' loader={loading} className='mt-4'>
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default DefaultTax
