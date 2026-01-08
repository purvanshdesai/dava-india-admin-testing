import React, { useState } from 'react'
import FormTextAreaField from '@/components/form/FormTextAreaField'
import FormInputField from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'

const AboutProduct = ({ form }: { form: UseFormReturn }) => {
  // UseFieldArray hooks are now called outside of sections
  const suitableForFieldArray = useFieldArray({
    control: form.control,
    name: 'aboutProduct.suitableFor'
  })
  const dosageFieldArray = useFieldArray({
    control: form.control,
    name: 'aboutProduct.dosage'
  })
  const cautionsFieldArray = useFieldArray({
    control: form.control,
    name: 'aboutProduct.cautions'
  })
  const benefitsFieldArray = useFieldArray({
    control: form.control,
    name: 'aboutProduct.benefits'
  })

  const sections: any = [
    { label: 'Info', value: 'info' },
    {
      label: 'Suitable For',
      value: 'suitableFor',
      fieldArray: suitableForFieldArray
    },
    { label: 'Dosage', value: 'dosage', fieldArray: dosageFieldArray },
    { label: 'Cautions', value: 'cautions', fieldArray: cautionsFieldArray },
    { label: 'Benefits', value: 'benefits', fieldArray: benefitsFieldArray },
    { label: 'Product Information', value: 'productInfo' },
    { label: 'Seller Information', value: 'sellerInfo' },
    { label: 'Manufacturer Information', value: 'manufacturerInfo' },
    { label: 'Packaged By', value: 'packagedByInfo' }
  ]

  const [selectedItem, setSelectedItem] = useState(sections[0])

  const handleCheckboxChange = (item: any) => {
    console.log('selected item ======= ', item.value)
    setSelectedItem(item)
  }

  const [textareaValues, setTextareaValues] = useState<Record<string, string>>({
    info: '',
    productInfo: '',
    sellerInfo: '',
    manufacturerInfo: '',
    packagedByInfo: ''
  })

  const updateTextareaValue = (value: string) => {
    setTextareaValues(prevValues => ({
      ...prevValues,
      [selectedItem.value]: value
    }))
  }

  const textAreaValues: any = [
    'info',
    'productInfo',
    'sellerInfo',
    'manufacturerInfo',
    'packagedByInfo'
  ]

  // Check if the selectedItem.value is in the textAreaValues array
  const showTextArea: boolean = textAreaValues.includes(selectedItem.value)

  return (
    <div className='mt-4'>
      <div>
        <div className='h-[529px]'>
          <div className='mb-5'>
            <h2 className='text-lg font-semibold tracking-tight'>
              About Product
            </h2>
          </div>
          <div className='grid h-full w-full grid-cols-10 border'>
            <div className='col-span-3 border p-2'>
              {sections.map((section: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex cursor-pointer flex-row items-center justify-start rounded-lg p-3 text-sm ${
                    selectedItem.value === section.value ? 'bg-[#FFE3D4]' : ''
                  }`}
                  onClick={() => handleCheckboxChange(section)}
                >
                  {/* <Checkbox
                    checked={selectedItem.value === section.value}
                    onCheckedChange={() => handleCheckboxChange(section)}
                    className='h-5 w-5 rounded-md border-primary focus-visible:ring-primary data-[state=checked]:bg-primary dark:border-primary dark:ring-offset-primary dark:data-[state=checked]:text-primary'
                  /> */}
                  <p className='ml-2'>{section.label}</p>
                </div>
              ))}
            </div>
            <div className='col-span-7 border'>
              <div>
                {showTextArea && (
                  <div className='p-5'>
                    <FormTextAreaField
                      key={selectedItem.value}
                      isSmall={true}
                      formInstance={form}
                      label=''
                      name={`aboutProduct.${selectedItem.value}`}
                      placeholder='Enter the intro for the product'
                      value={textareaValues[selectedItem.value]}
                      onChange={(e: any) => updateTextareaValue(e.target.value)}
                    />
                  </div>
                )}

                {![
                  'info',
                  'productInfo',
                  'sellerInfo',
                  'manufacturerInfo',
                  'packagedByInfo'
                ].includes(selectedItem.value) && (
                  <div className='mb-2 flex flex-row items-start justify-between p-5'>
                    <div className='w-[90%]'>
                      {sections
                        .find((s: any) => s.value === selectedItem.value)
                        .fieldArray.fields.map((field: any, index: number) => (
                          <div
                            key={field.id}
                            className='mb-2 flex items-center gap-2'
                          >
                            <div className='p-1'>{index + 1}.</div>
                            <div className='flex-grow'>
                              <FormInputField
                                formInstance={form}
                                name={`aboutProduct.${selectedItem.value}.${index}`}
                                label=''
                                isSmall={true}
                              />
                            </div>
                            <Button
                              type='button'
                              onClick={() =>
                                sections
                                  .find(
                                    (s: any) => s.value === selectedItem.value
                                  )
                                  .fieldArray.insert(index + 1, '')
                              }
                              className='mt-2'
                            >
                              <Plus width={18} />
                            </Button>
                            <Button
                              type='button'
                              onClick={() =>
                                sections
                                  .find(
                                    (s: any) => s.value === selectedItem.value
                                  )
                                  .fieldArray.remove(index)
                              }
                              className='mt-2'
                            >
                              <Minus width={18} />
                            </Button>
                          </div>
                        ))}
                    </div>
                    {![
                      'info',
                      'productInfo',
                      'sellerInfo',
                      'manufacturerInfo',
                      'packagedByInfo'
                    ].includes(selectedItem.value) &&
                    !sections.find((s: any) => s.value === selectedItem.value)
                      .fieldArray.fields.length ? (
                      <Button
                        type='button'
                        onClick={() =>
                          sections
                            .find((s: any) => s.value === selectedItem.value)
                            .fieldArray.append('')
                        }
                        className='mt-2'
                      >
                        <Plus width={18} />
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutProduct
