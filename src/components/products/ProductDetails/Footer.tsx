import { Button } from '@/components/ui/button'
import { UseFormReturn } from 'react-hook-form'
import { useRouter, useSearchParams, useParams } from 'next/navigation'

const Footer = ({
  form,
  disabled = false,
  onSubmit,
  onError,
  loading
}: {
  form: UseFormReturn
  disabled?: boolean
  onSubmit: (values: unknown) => void
  onError: (values: unknown) => void
  loading: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ _id: string; productId: string }>()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const clickFn = () => {
    form.handleSubmit(onSubmit, onError)()
  }
  const goBack = () => {
    if (params._id && params.productId) {
      if (page && limit)
        router.push(
          `/products/variations/${params._id}?page=${page}&limit=${limit}`
        )
      else router.push(`/products/variations/${params._id}`)
    } else {
      if (page && limit) router.push(`/products?page=${page}&limit=${limit}`)
      else router.push(`/products`)
    }
  }

  return (
    <div className={'flex h-full items-center justify-end gap-4 px-5 py-3'}>
      <Button
        variant={'secondary'}
        className={'w-24 border border-gray-500 bg-white text-center'}
        onClick={() => goBack()}
      >
        Cancel
      </Button>
      <Button
        disabled={disabled}
        className={'w-24 text-center'}
        loader={loading}
        onClick={clickFn}
      >
        Save
      </Button>
    </div>
  )
}

export default Footer
