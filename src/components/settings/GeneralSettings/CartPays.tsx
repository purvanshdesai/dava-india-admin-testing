import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export default function CartPays({ form }: { form: UseFormReturn }) {
  const hasManagePermission = hasPermission(
    MODULES_PERMISSIONS.GENERAL_SETTING_MANAGEMENT.key,
    MODULES_PERMISSIONS.GENERAL_SETTING_MANAGEMENT.permissions
      .MANAGE_GENERAL_SETTING
  )
  return (
    <div className={'w-1/2'}>
      <div className={'py-2'}>
        <CustomFormField
          disabled={hasManagePermission ? false : true}
          formInstance={form}
          name={'handlingCharge'}
          label={'Handling Charges'}
        />
      </div>
      <div className={'py-2'}>
        <CustomFormField
          disabled={hasManagePermission ? false : true}
          formInstance={form}
          name={'packingCharge'}
          label={'Packing Charges'}
        />
      </div>
      <div className={'py-2'}>
        <CustomFormField
          disabled={hasManagePermission ? false : true}
          formInstance={form}
          name={'platformFee'}
          label={'Platform Fee'}
        />
      </div>
    </div>
  )
}

const CustomFormField = ({
  formInstance: form,
  name,
  label,
  disabled
}: {
  formInstance: UseFormReturn
  name: string
  label: string
  disabled: boolean
}) => {
  return (
    <FormField
      control={form?.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel
              className={cn('text-sm', 'text-black dark:text-gray-300')}
            >
              <div className={'flex items-center'}>
                <div>{label}</div>
                <Switch
                  disabled={disabled}
                  className={'mx-2'}
                  checked={form.watch(`${name}Applicable`)}
                  onCheckedChange={checked =>
                    form.setValue(`${name}Applicable`, checked)
                  }
                />
                <div className={'text-xs font-normal'}>
                  {form.watch(`${name}Applicable`) ? 'Included' : 'Excluded'}
                </div>
              </div>
            </FormLabel>
          )}
          <FormControl>
            <div className='relative'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500'>
                ₹
              </span>
              <Input
                disabled={disabled}
                {...field}
                className={cn('rounded-lg pl-8 dark:text-gray-300')}
                type={'number'}
              />
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
