import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChangeEvent, useRef } from 'react'
import { uploadFiles } from '@/utils/utils/fileUpload'
import UploadImagePreview from '@/components/form/UploadImagePreview'
import { UseFormReturn } from 'react-hook-form'
import { UploadedObject } from '../../../types/type'

const FormUploadField = ({
  formInstance: form,
  label,
  name,
  isSmall,
  isReq,
  multiple,
  accept
}: {
  formInstance: UseFormReturn
  name: string
  label?: string
  isSmall?: boolean
  isReq?: boolean
  multiple?: boolean
  accept?: string
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const filesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.files?.length) {
        const fileList = Array.from(event.target.files)
        const files = await uploadFiles(fileList)
        console.log('files===== ', files)
        const currentFiles = form.getValues(name)
        if (currentFiles && Array.isArray(currentFiles)) {
          form.setValue(name, [...form.getValues(name), ...files])
        } else {
          form.setValue(name, files[0])
        }
      }
    } catch (error) {
      throw error
    }
  }

  const removeFile = (index?: number) => {
    const files = form.getValues(name)
    if (Array.isArray(files)) {
      form.setValue(
        name,
        files.filter((_, i) => i !== index)
      )
    } else {
      form.setValue(name, null)
    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({}) => (
        <FormItem>
          <FormLabel
            className={cn(
              isSmall ? 'text-sm' : 'text-lg',
              'text-black dark:text-gray-300'
            )}
          >
            {label}
            {label && isReq && <span className='text-red-600'>*</span>}
          </FormLabel>
          <FormControl>
            <div className={'flex items-center gap-3 py-5'}>
              <div className={'flex gap-3 p-2'}>
                {form.getValues(name) ? (
                  Array.isArray(form.getValues(name)) ? (
                    form
                      .getValues(name)
                      .map((obj: UploadedObject, idx: number) => (
                        <UploadImagePreview
                          key={idx}
                          object={obj}
                          removeFile={() => removeFile(idx)}
                        />
                      ))
                  ) : (
                    <UploadImagePreview
                      object={form.getValues(name)}
                      removeFile={() => removeFile()}
                    />
                  )
                ) : null}
              </div>
              <div className={'flex h-32 w-32 items-center justify-center'}>
                <Button
                  type='button'
                  className={'w-24 text-center'}
                  onClick={() => fileInputRef?.current?.click()}
                >
                  Upload
                </Button>
                <input
                  type={'file'}
                  className={'hidden'}
                  ref={fileInputRef}
                  onChange={filesSelected}
                  multiple={multiple}
                  accept={accept}
                />
              </div>
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormUploadField
