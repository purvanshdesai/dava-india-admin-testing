import FormInputField from '@/components/form/FormInputField'
import FormStringArrayField from '@/components/form/FormStringArrayField'
import { UseFormReturn } from 'react-hook-form'

const SEODetails = ({
  form,
  hasReadOnly
}: {
  form: UseFormReturn
  hasReadOnly: boolean
}) => {
  return (
    <div className='p-1'>
      <div className={'my-4 text-lg font-semibold'}>SEO</div>
      <div className='container m-auto grid grid-cols-2 gap-8'>
        <FormInputField
          isSmall={true}
          formInstance={form}
          isReq={true}
          name={'seo.url'}
          label={'Slug URL'}
          disabled={hasReadOnly}
        />
        <FormInputField
          isSmall={true}
          isReq={true}
          formInstance={form}
          name={'seo.metaTitle'}
          label={'Meta Title'}
          disabled={hasReadOnly}
        />
        <FormInputField
          isSmall={true}
          formInstance={form}
          name={'seo.metaDescription'}
          label={'Meta Description'}
          disabled={hasReadOnly}
        />
        <FormStringArrayField
          formInstance={form}
          name={'seo.keywords'}
          label={'Keywords'}
          disabled={hasReadOnly}
        />
      </div>
    </div>
  )
}

export default SEODetails
