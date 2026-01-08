import React, { useEffect, useState } from 'react'
import FormTextAreaField from '@/components/form/FormTextAreaField'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  Languages,
  Loader2,
  Minus,
  Plus,
  Trash2
} from 'lucide-react'
import { Controller, useFieldArray, UseFormReturn } from 'react-hook-form'
import FormDialog from '@/components/form/FormDialogBox'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import CategoryTranslationForm from '@/components/category/CategoryTranslationForm'
import { useGetSupportedLanguages } from '@/utils/hooks/appDataHooks'
import { DialogClose } from '@radix-ui/react-dialog'
import dynamic from 'next/dynamic'
import { useProductInfoGen } from '@/utils/hooks/productHooks'
import { useToast } from '@/hooks/use-toast'

const TiptapEditor = dynamic(() => import('../../ui/TipTapEditor'), {
  ssr: false
})

const AboutProduct = ({
  form,
  hasReadOnly
}: {
  form: UseFormReturn
  hasReadOnly: boolean
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [selectedSections, setSelectedSections] = useState<any[]>(
    form.getValues('selectedSections') ?? []
  ) // Track selected sections
  const { data: languages }: any = useGetSupportedLanguages({})
  const [showNameTranslation, setShowNameTranslation] = useState(false)
  const [showDescriptionTranslation, setShowDescriptionTranslation] =
    useState(false)
  // Define field arrays
  const { toast } = useToast()
  const productInfoGenerator = useProductInfoGen()
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
  const sideEffectsFieldArray = useFieldArray({
    control: form.control,
    name: 'aboutProduct.sideEffects'
  })
  const toggleNameTranslation: any = () => {
    if (showDescriptionTranslation) setShowDescriptionTranslation(false)
    setShowNameTranslation(!showNameTranslation)
  }
  // Sections array
  const sections: any = [
    { label: 'Product Description', value: 'info' },
    { label: 'Drug Interaction', value: 'drugInteraction' },
    {
      label: 'Suitable For',
      value: 'suitableFor',
      fieldArray: suitableForFieldArray
    },
    { label: 'Dosage', value: 'dosage', fieldArray: dosageFieldArray },
    {
      label: 'Cautions',
      value: 'cautions',
      fieldArray: cautionsFieldArray
    },
    { label: 'Benefits', value: 'benefits', fieldArray: benefitsFieldArray },
    {
      label: 'Side Effects',
      value: 'sideEffects',
      fieldArray: sideEffectsFieldArray
    },
    { label: 'Key Ingredients', value: 'productInfo' },
    { label: 'Seller Information', value: 'sellerInfo' },
    { label: 'Manufacturer Information', value: 'manufacturerInfo' },
    { label: 'Packaged By', value: 'packagedByInfo' },
    { label: 'Directions For Use', value: 'directionsForUse' }
  ]

  const isTextAreaSection = (sectionValue: string) => {
    return [
      'info',
      'drugInteraction',
      'productInfo',
      'sellerInfo',
      'manufacturerInfo',
      'packagedByInfo',
      'directionsForUse'
    ].includes(sectionValue)
  }

  const handleProductInfoGenerator = async () => {
    try {
      const productName = form.getValues('title')
      const productCompositions = form.getValues('compositions')
      if (!productName) {
        toast({
          title: 'Please add Product Name and Product compositions fields'
        })
        return
      }
      if (!productCompositions) {
        toast({
          title: 'Please add Product compositions field'
        })
        return
      }
      const data = await productInfoGenerator.mutateAsync({
        productName,
        productCompositions: productCompositions,
        productDescription: ''
      })
      const information = data?.information
      if (information && typeof information == 'object') {
        for (const section of selectedSections) {
          const sectionData = form.getValues(`aboutProduct.${section?.value}`)
          console.log('sec data ', sectionData)
          console.log('sec check ', !sectionData || !sectionData?.length)
          if (!sectionData || !sectionData?.length || !sectionData[0]) {
            if (typeof information == 'object' && information[section.value]) {
              form.setValue(
                `aboutProduct.${section?.value}`,
                information[section.value]
              )
            }
          }
        }
        toast({
          title: 'Content successfully added'
        })
      } else {
        toast({
          title: 'Something went wrong',
          description: 'Product information generation failed please try again'
        })
      }
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Product information generation failed please try again'
      })
      throw error
    }
  }

  // Ensure two default input boxes if required
  useEffect(() => {
    if (suitableForFieldArray.fields.length === 0) {
      suitableForFieldArray.append('')
      suitableForFieldArray.append('')
    }
    if (dosageFieldArray.fields.length === 0) {
      dosageFieldArray.append('')
      dosageFieldArray.append('')
    }
    if (cautionsFieldArray.fields.length === 0) {
      cautionsFieldArray.append('')
      cautionsFieldArray.append('')
    }
    if (benefitsFieldArray.fields.length === 0) {
      benefitsFieldArray.append('')
      benefitsFieldArray.append('')
    }
    if (sideEffectsFieldArray.fields.length === 0) {
      sideEffectsFieldArray.append('')
      sideEffectsFieldArray.append('')
    }
  }, [])

  const handleCheckboxChange = (section: any) => {
    if (selectedSections.some(s => s.value === section.value)) {
      console.log('selectedSections2', selectedSections)
      console.log('selectedSections3', [
        ...selectedSections.filter(s => s.value !== section.value)
      ])

      setSelectedSections(prev => prev.filter(s => s.value !== section.value))
    } else {
      form.setValue('selectedSections', [...selectedSections, section])
      console.log('selectedSections3', [...selectedSections, section])
      setSelectedSections(prev => [...prev, section])
    }
    // form.setValue('selectedSections', selectedSections)
  }

  const removeSelected = (section: any) => {
    setSelectedSections(prev => prev.filter(s => s.value !== section.value))
    const currentSections = form.getValues('selectedSections') || []

    // Filter out the section that matches the value
    const updatedSections = currentSections.filter(
      (s: any) => s.value !== section.value
    )

    // Update the selectedSections in the form
    form.setValue('selectedSections', updatedSections)

    form.unregister(`aboutProduct.${section.value}`)
  }

  const handleAddClick = () => {
    setOpenModal(false)
  }

  const [textareaValues, setTextareaValues] = useState<Record<string, any>>({
    info: '',
    drugInteraction: '',
    productInfo: '',
    sellerInfo: '',
    manufacturerInfo: '',
    packagedByInfo: '',
    directionsForUse: ''
  })

  const updateTextareaValue = (value: string, section: string) => {
    setTextareaValues(prevValues => ({
      ...prevValues,
      [section]: value
    }))
  }

  const textAreaSections = [
    'info',
    'drugInteraction',
    'productInfo',
    'sellerInfo',
    'manufacturerInfo',
    'packagedByInfo',
    'directionsForUse'
  ]
  const handleSelectAllChange = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedSections(sections) // Select all
      form.setValue('selectedSections', sections)
    } else {
      setSelectedSections([]) // Deselect all
      form.setValue('selectedSections', [])
    }
  }
  const isSelectAllChecked = selectedSections.length === sections.length
  return (
    <div className='my-4 px-1'>
      <div>
        <div className=''>
          <div className='mb-5 flex flex-row items-center justify-between'>
            <h2 className='text-lg font-semibold tracking-tight'>
              About Product
            </h2>

            <Dialog open={openModal}>
              <DialogTrigger
                disabled={hasReadOnly}
                onClick={(e: any) => {
                  e.preventDefault()
                  setOpenModal(true)
                }}
              >
                <Button
                  disabled={hasReadOnly}
                  className='w-full rounded-lg bg-orange-500 p-2 text-white'
                >
                  Add Sections
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Sections</DialogTitle>
                </DialogHeader>
                <div className='h-[40vh] overflow-auto p-5'>
                  <div className='flex justify-center'>
                    {selectedSections?.length ? (
                      <Button
                        disabled={productInfoGenerator.isPending}
                        className='inline'
                        variant='outline'
                        onClick={handleProductInfoGenerator}
                        type='button'
                        size={'sm'}
                      >
                        {productInfoGenerator.isPending ? (
                          <>
                            <Loader2 className='inline animate-spin' />
                            <span> Please wait</span>
                          </>
                        ) : (
                          'Use ChatGPT for Information generation'
                        )}
                      </Button>
                    ) : null}
                  </div>
                  <div className='mb-2 flex items-center gap-2 p-3'>
                    <input
                      type='checkbox'
                      id='select-all'
                      onChange={e => handleSelectAllChange(e.target.checked)}
                      checked={isSelectAllChecked}
                    />
                    <label htmlFor='select-all'>Select All</label>
                  </div>
                  {sections.map((section: any) => (
                    <div
                      key={section.value}
                      className='mb-2 flex items-center gap-2 rounded-lg border bg-[#f9fbfd] p-3'
                    >
                      <input
                        type='checkbox'
                        id={`section-${section.value}`}
                        onChange={() => handleCheckboxChange(section)}
                        checked={selectedSections.some(
                          s => s.value === section.value
                        )}
                      />
                      <label htmlFor={`section-${section.value}`}>
                        {section.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className='p-5'>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-[197px]'
                    onClick={() => setOpenModal(false)}
                  >
                    <p>Cancel</p>
                  </Button>
                  <Button
                    type='button'
                    className='ml-5 w-[197px]'
                    onClick={handleAddClick}
                  >
                    Add
                  </Button>
                </div>
                {/* <DialogFooter>
                  <div className='p-5'>
                    <Button
                      type='button'
                      variant='outline'
                      className='w-[197px]'
                      onClick={() => setOpenModal(false)}
                    >
                      <p>Cancel</p>
                    </Button>
                    <Button
                      type='button'
                      className='ml-5 w-[197px]'
                      onClick={handleAddClick}
                    >
                      Add
                    </Button>
                  </div>
                </DialogFooter> */}
              </DialogContent>
            </Dialog>
          </div>

          {/* Render only selected sections */}
          {sections.map(
            (section: any) =>
              selectedSections.some(s => s.value === section.value) && (
                <Collapsible
                  key={section.value}
                  className='mt-5 w-[100%] rounded-lg border bg-[#f9fbfd] p-5'
                >
                  <CollapsibleTrigger className='w-full'>
                    <div className='flex w-full flex-row items-center justify-between'>
                      <div className='font-semibold'>{section.label}</div>
                      <div className='flex flex-row items-center justify-center'>
                        {!hasReadOnly && (
                          <div onClick={() => removeSelected(section)}>
                            <Trash2 color='orange' size={20} />
                          </div>
                        )}
                        <div className='ml-5'>
                          <ChevronDown />
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {textAreaSections.includes(section.value) ? (
                      <div className='flex flex-row items-start justify-start p-5'>
                        <div className='mr-3 w-[95%]'>
                          {section.value === 'info' ? (
                            <TiptapEditor
                              value={
                                textareaValues[section.value] ||
                                form.getValues(`aboutProduct.${section.value}`)
                              }
                              onChange={(val: string) => {
                                updateTextareaValue(val, section.value)
                                form.setValue(
                                  `aboutProduct.${section.value}`,
                                  val
                                )
                              }}
                              readOnly={hasReadOnly}
                            />
                          ) : (
                            <FormTextAreaField
                              disabled={hasReadOnly}
                              key={section.value}
                              isSmall={true}
                              formInstance={form}
                              label=''
                              name={`aboutProduct.${section.value}`}
                              placeholder='Enter the intro for the product'
                              value={textareaValues[section.value] || ''}
                              onChange={(e: any) =>
                                updateTextareaValue(
                                  e.target.value,
                                  section.value
                                )
                              }
                            />
                          )}
                        </div>
                        {
                          <FormDialog
                            content={
                              <CategoryTranslationForm
                                type={`aboutProduct.${section.value}`}
                                formInstance={form}
                                translationValues={languages?.sort(
                                  (a: any, b: any) =>
                                    a.name.localeCompare(b.name)
                                )}
                                formType={
                                  section.value == 'info'
                                    ? 'richText'
                                    : 'textarea'
                                }
                                disabled={hasReadOnly}
                              />
                            }
                            trigger={
                              <div
                                className='cursor-pointer rounded-lg border-2 border-primary p-2'
                                onClick={toggleNameTranslation}
                              >
                                <Languages className='text-primary' size={20} />
                              </div>
                            }
                            title={`${section.value} translation`}
                            footerActions={() => (
                              <div className='flex items-center gap-3'>
                                <DialogClose>
                                  <Button
                                    variant='secondary'
                                    onClick={() => form.reset()}
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <DialogClose disabled={hasReadOnly}>
                                  <Button disabled={hasReadOnly}>Save</Button>
                                </DialogClose>
                              </div>
                            )}
                          />
                        }
                      </div>
                    ) : (
                      <div className='mb-2 flex flex-row items-start justify-between p-5'>
                        <div className='w-[90%]'>
                          {/* Iterate over sections with fieldArray */}
                          {section.fieldArray.fields.map(
                            (field: any, index: number) => (
                              <div
                                key={field.id}
                                className='mb-2 flex items-center gap-2'
                              >
                                <div className='p-1'>{index + 1}.</div>
                                <div className='flex-grow'>
                                  {isTextAreaSection(section.value) ? (
                                    <div>
                                      <Controller
                                        disabled={hasReadOnly}
                                        name={`aboutProduct.${section.value}.${index}`}
                                        control={form.control}
                                        render={({ field }) => (
                                          <textarea
                                            {...field}
                                            className='w-full rounded border p-2'
                                            rows={4}
                                          />
                                        )}
                                      />
                                      {
                                        <FormDialog
                                          content={
                                            <CategoryTranslationForm
                                              type={`aboutProduct.${section.value}.${index}`}
                                              formInstance={form}
                                              translationValues={languages?.sort(
                                                (a: any, b: any) =>
                                                  a.name.localeCompare(b.name)
                                              )}
                                              formType='textarea'
                                              disabled={hasReadOnly}
                                            />
                                          }
                                          trigger={
                                            <div
                                              className='cursor-pointer rounded-lg border-2 border-primary p-2'
                                              onClick={toggleNameTranslation}
                                            >
                                              <Languages
                                                className='text-primary'
                                                size={20}
                                              />
                                            </div>
                                          }
                                          title={`${section.value} translation`}
                                          footerActions={() => (
                                            <div className='flex items-center gap-3'>
                                              <DialogClose>
                                                <Button
                                                  variant='secondary'
                                                  onClick={() => form.reset()}
                                                >
                                                  Cancel
                                                </Button>
                                              </DialogClose>
                                              <DialogClose
                                                disabled={hasReadOnly}
                                              >
                                                <Button disabled={hasReadOnly}>
                                                  Save
                                                </Button>
                                              </DialogClose>
                                            </div>
                                          )}
                                        />
                                      }
                                    </div>
                                  ) : (
                                    <Controller
                                      disabled={hasReadOnly}
                                      name={`aboutProduct.${section.value}.${index}`}
                                      control={form.control}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          className='w-full rounded border p-2'
                                        />
                                      )}
                                    />
                                  )}
                                </div>
                                {!hasReadOnly && (
                                  <Button
                                    type='button'
                                    onClick={() =>
                                      section.fieldArray.insert(index + 1, '')
                                    }
                                    className='mt-2'
                                  >
                                    <Plus width={18} />
                                  </Button>
                                )}
                                {!hasReadOnly && (
                                  <Button
                                    type='button'
                                    onClick={() =>
                                      section.fieldArray.remove(index)
                                    }
                                    className='mt-2'
                                  >
                                    <Minus width={18} />
                                  </Button>
                                )}
                                {
                                  <FormDialog
                                    content={
                                      <CategoryTranslationForm
                                        type={`aboutProduct.${section.value}.${index}`}
                                        formInstance={form}
                                        translationValues={languages?.sort(
                                          (a: any, b: any) =>
                                            a.name.localeCompare(b.name)
                                        )}
                                        formType='textarea'
                                        disabled={hasReadOnly}
                                      />
                                    }
                                    trigger={
                                      <div
                                        className='mt-2 cursor-pointer rounded-lg border-2 border-primary p-2'
                                        onClick={toggleNameTranslation}
                                      >
                                        <Languages
                                          className='text-primary'
                                          size={20}
                                        />
                                      </div>
                                    }
                                    title={`${section.value} translation`}
                                    footerActions={() => (
                                      <div className='flex items-center gap-3'>
                                        <DialogClose>
                                          <Button
                                            variant='secondary'
                                            onClick={() => form.reset()}
                                          >
                                            Cancel
                                          </Button>
                                        </DialogClose>
                                        <DialogClose disabled={hasReadOnly}>
                                          <Button disabled={hasReadOnly}>
                                            Save
                                          </Button>
                                        </DialogClose>
                                      </div>
                                    )}
                                  />
                                }
                              </div>
                            )
                          )}
                        </div>

                        {/* Show Plus button if no input boxes exist */}
                        {!section.fieldArray.fields.length && !hasReadOnly ? (
                          <Button
                            type='button'
                            onClick={() => section.fieldArray.append('')}
                            className='mt-2'
                          >
                            <Plus width={18} />
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )
          )}
        </div>
      </div>
    </div>
  )
}

export default AboutProduct
