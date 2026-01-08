import { UseFormReturn } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function GeneralSettingsFooter({
  form,
  onSubmit,
  onError,
  loading
}: {
  form: UseFormReturn
  onSubmit: (values: unknown) => void
  onError: (values: unknown) => void
  loading: boolean
}) {
  const router = useRouter()

  const clickFn = () => {
    form.handleSubmit(onSubmit, onError)()
  }

  return (
    <div className={'flex h-full items-center justify-end gap-4 px-5 py-3'}>
      <Button
        variant={'secondary'}
        className={'w-24 border border-gray-500 bg-white text-center'}
        onClick={() => router.push('/settings')}
      >
        Cancel
      </Button>
      <Button className={'w-24 text-center'} loader={loading} onClick={clickFn}>
        Save
      </Button>
    </div>
  )
}
