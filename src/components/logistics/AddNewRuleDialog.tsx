import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import FormDialog from '@/components/form/FormDialogBox'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useAddNewLogisticsRule } from '@/utils/hooks/logisticsHooks'
import { DialogClose } from '@/components/ui/dialog'

export default function AddNewLogisticsRuleDialog({
  page,
  limit
}: {
  page: number
  limit: number
}) {
  const router = useRouter()

  const [ruleName, setRuleName] = useState<string>('')
  const [error, setError] = useState<string>('')

  const { mutateAsync } = useAddNewLogisticsRule()

  const saveRule = async () => {
    if (!ruleName.trim().length) {
      setError('Rule name can not be empty')
      return
    }
    const resp = await mutateAsync({ ruleName })
    router.push(`/logistics/${resp._id}?page=${page}&limit=${limit}`)
  }

  const onTypeRuleName = (val: string) => {
    setError('')
    setRuleName(val)
  }

  return (
    <FormDialog
      footerNotReq={true}
      content={
        <div className={'flex flex-col items-center'}>
          <Image
            src={'/images/dialog-question.svg'}
            alt={'Question'}
            height={150}
            width={150}
          />
          <div className={'my-5'}>
            Please enter the name of the logistics rule
          </div>
          <div className={'my-2 w-full'}>
            <Input
              type={'text w-full'}
              value={ruleName}
              onInput={(e: any) => onTypeRuleName(e.target.value)}
            />
          </div>
          {error && <div className={'text-sm text-red-500'}>{error}</div>}
          <div className='mt-3 flex w-full flex-row items-center justify-center space-x-4'>
            <DialogClose
              className={
                'flex w-1/2 items-center rounded-lg text-sm text-primary'
              }
            >
              <Button className='w-full' variant={'outline'}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className='flex w-1/2 items-center rounded-lg text-sm'
              onClick={saveRule}
            >
              Save
            </Button>
          </div>
        </div>
      }
      trigger={
        <Button size={'sm'} className='flex items-center gap-2'>
          <Plus />
          Add New
        </Button>
      }
      footerActions={null}
    />
  )
}
