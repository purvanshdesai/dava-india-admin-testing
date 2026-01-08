'use client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as XLSX from 'xlsx'
import { UseFormReturn } from 'react-hook-form'
import FormMultiField from '@/components/form/FormMultiField'

export default function FieldDialog({
  label,
  name,
  type,
  formInstance
}: {
  label: string
  name: 'forEmails' | 'forPhoneNos'
  type: 'email' | 'phone'
  formInstance: UseFormReturn
}) {
  const values = formInstance.watch(name) || []

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

    const newValues = jsonData.map((row: any) => row[type]).filter(Boolean)
    formInstance.setValue(name, [...values, ...newValues])
  }
  const validateInput = (input: any) => {
    const value = String(input || '').trim()
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    } else if (type === 'phone') {
      const phoneRegex = /^\+?[0-9\s]{10,15}$/
      const plainNumber = value.replace(/\s+/g, '') // Remove spaces for validation
      return (
        phoneRegex.test(value) &&
        plainNumber.length >= 10 &&
        plainNumber.length <= 13
      )
    }
    // For keywords, no specific validation is applied
    return value.length > 0
  }

  const getValues = formInstance.getValues(name) || []
  const invalidItems = getValues?.filter((item: string) => !validateInput(item))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-between text-left text-sm font-medium'
        >
          {label} ({values.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {label}</DialogTitle>
        </DialogHeader>

        <div>
          {' '}
          <FormMultiField
            type={type}
            formInstance={formInstance}
            label=''
            name={name}
            placeholder={`Enter ${type === 'email' ? 'Email' : 'Phone No'}`}
          />
        </div>

        {invalidItems.length > 0 && (
          <div className='pl-1 text-xs font-medium text-red-600'>
            {invalidItems.length}{' '}
            {type === 'email'
              ? `email${invalidItems.length > 1 ? 's' : ''}`
              : type === 'phone'
                ? `phone number${invalidItems.length > 1 ? 's' : ''}`
                : `item${invalidItems.length > 1 ? 's' : ''}`}{' '}
            have validation error{invalidItems.length > 1 ? 's' : ''}.
          </div>
        )}

        <div className='flex flex-col gap-2'>
          <Label className='text-sm font-medium text-gray-700'>
            Upload {type === 'email' ? 'Emails' : 'Phone Numbers'} via Excel
          </Label>
          <Input
            type='file'
            accept='.xlsx, .xls'
            onChange={handleFileUpload}
            className='cursor-pointer border border-dashed border-gray-400 pb-12 file:rounded-md file:border-none file:bg-orange-500 file:px-4 file:py-2 file:text-white'
          />
        </div>
        <div className='flex items-center justify-end gap-2'>
          <DialogClose>
            <Button variant='secondary' onClick={() => formInstance.reset()}>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose disabled={invalidItems.length > 0}>
            <Button disabled={invalidItems.length > 0}>Save</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
