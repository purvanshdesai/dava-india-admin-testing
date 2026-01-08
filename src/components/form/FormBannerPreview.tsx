import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { UseFormReturn } from 'react-hook-form'
import Image from 'next/image'
import { UploadedObject } from '../../../types/type'
import FormInputField from './FormInputField'

const FormBannerPreview = ({
  object,
  removeFile,
  formInstance,
  name,
  index
}: {
  object: UploadedObject
  removeFile: () => void
  formInstance: UseFormReturn
  name: string
  index: number
}) => {
  return (
    <div className='flex w-full flex-col gap-2'>
      {/* Image Preview */}
      <div className='relative h-[200px] w-full rounded-lg'>
        <Image
          src={object.objectUrl}
          alt={object?.objectDetails?.originalFileName}
          layout='fill'
          objectFit='cover'
        />
      </div>

      {/* Redirect URL Input Field */}
      <div className='flex items-center justify-between'>
        <FormField
          control={formInstance.control}
          name={name}
          render={({}) => (
            <FormItem>
              <FormInputField
                formInstance={formInstance}
                name={`images${index}.redirectUrl`}
                label={'Redirect URL (Optional)'}
                placeholder={'Enter redirect URL'}
                isSmall={true}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remove Button */}
        <Button type='button' onClick={removeFile}>
          Remove
        </Button>
      </div>
    </div>
  )
}

export default FormBannerPreview
