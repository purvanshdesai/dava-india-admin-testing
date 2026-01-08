import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { usePatchTax, useSubmitAddTax } from '@/utils/hooks/taxesHooks'
import { useToast } from '@/hooks/use-toast'
import { handleGetTax } from '@/utils/actions/taxesActions'
import { Textarea } from '../ui/textarea'
import { AddTaxesType, handleGetAllTaxes } from '@/utils/actions/appDataActions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
const AddNewTax = ({ label = 'Add New', id }: any) => {
  const handleSubmitTax = useSubmitAddTax()
  const [taxName, setTaxName] = useState('')
  const [taxNameError, setTaxNameError] = useState('')
  const [taxNote, setTaxNote] = useState('')
  const [taxRate, setTaxRate] = useState('')
  const [cgst, setCgstTaxRate] = useState('')
  const [sgst, setSgstTaxRate] = useState('')
  const [igst, setIgstTaxRate] = useState('')
  const [gstCalcError, setGstCalcError] = useState('')

  const [taxRateError, setTaxRateError] = useState('')
  const [taxType, setTaxType] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const patchTaxMutation = usePatchTax()
  // usePatchTax
  const { toast } = useToast()
  const [editDetails, setEditDetails] = useState<any>(null) // Store edit details
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [items, setItems] = useState<any>([])
  // const [selectedItemId, setSelectedItemId] = useState(null)

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value)
    setDropdownOpen(true)
  }

  const handleSelect = (item: any) => {
    setTaxType(item.name?.trim())
    setDropdownOpen(false)
    setSearchTerm(item.name) // Set the selected item name in the input box
  }

  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddNewItem = async () => {
    const newItem: any = {
      _id: Date.now().toString(), // Temporary _id based on timestamp
      name: searchTerm,
      type: 'taxes'
    }

    setTaxType(searchTerm)
    await AddTaxesType({ type: 'taxes', name: searchTerm })

    // Add the new item to the list and select it
    setItems([...items, newItem])
    handleSelect(newItem) // This will update the input box with the new item name
  }

  const validateGstComponents = () => {
    const isValid =
      Number(taxRate) ===
      Number(cgst ?? 0) + Number(sgst ?? 0) + Number(igst ?? 0)

    if (isValid)
      return {
        isValid,
        components: [
          {
            name: 'CGST',
            rate: cgst,
            rateType: 'percentage'
          },
          {
            name: 'SGST',
            rate: sgst,
            rateType: 'percentage'
          },
          {
            name: 'IGST',
            rate: igst,
            rateType: 'percentage'
          }
        ]
      }

    return { isValid, components: [] }
  }

  const handleAdd = async () => {
    setTaxNameError('')
    setTaxRateError('')

    if (!taxName?.length) {
      setTaxNameError('Tax name is required')
      return
    }
    if (!taxRate.length) {
      setTaxRateError('Tax rate is required')
      return
    }
    setDropdownOpen(false)

    const payload: any = {
      name: taxName,
      category: 'single',
      rate: taxRate,
      type: taxType,
      rateType: 'percentage',
      taxNote
    }

    // If type is GST, validate the components
    if (payload.type === 'GST') {
      const { isValid, components } = validateGstComponents()

      if (!isValid) {
        setGstCalcError('Invalid')
        return
      }
      payload.components = components
    }

    if (label === 'Edit') {
      await patchTaxMutation.mutateAsync({
        taxId: id,
        data: payload
      })

      toast({
        title: 'Success',
        description: 'Updated successfully'
      })
    } else {
      await handleSubmitTax.mutateAsync(payload)

      toast({
        title: 'Success',
        description: 'Added successfully'
      })
    }

    setTaxName('')
    setTaxRate('')
    setTaxNote('')
    setTaxType('')
    setCgstTaxRate('')
    setSgstTaxRate('')
    setIgstTaxRate('')
    setOpenModal(false)
  }

  // Fetch existing tax details if editing
  async function fetch() {
    if (id) {
      const response = await handleGetTax(id)
      setEditDetails(response)
    }
  }

  async function fetchTaxes() {
    const data = await handleGetAllTaxes()
    setItems(data)
  }

  useEffect(() => {
    fetch()
  }, [id])

  useEffect(() => {
    fetchTaxes()
  }, [])
  // Update form fields when editDetails is fetched
  useEffect(() => {
    if (editDetails) {
      setTaxName(editDetails.name)
      setTaxRate(editDetails.rate)
      setTaxType(editDetails.type)
      setSearchTerm(editDetails.type)
      setTaxNote(editDetails.taxNote)

      if (editDetails?.type == 'GST') {
        const components = editDetails?.components
        setCgstTaxRate(
          components?.find((comp: any) => comp.name === 'CGST')?.rate
        )
        setSgstTaxRate(
          components?.find((comp: any) => comp.name === 'SGST')?.rate
        )
        setIgstTaxRate(
          components?.find((comp: any) => comp.name === 'IGST')?.rate
        )
      }
    }
  }, [editDetails])

  return (
    <div>
      <div>
        <Dialog open={openModal}>
          <DialogTrigger onClick={() => setOpenModal(true)}>
            {label === 'Edit' ? (
              <div>Edit</div>
            ) : (
              <Button size='sm' className='flex items-center gap-2'>
                {label}
              </Button>
            )}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{id ? 'Edit Tax' : 'Add New Tax'}</DialogTitle>{' '}
              {/* Change title based on action */}
            </DialogHeader>
            <div className='max-h-[500px] space-y-4 overflow-y-auto p-3'>
              <div>
                <label
                  htmlFor='taxName'
                  className='mb-2 mt-2 block text-sm font-semibold text-black'
                >
                  Tax Name
                </label>
                <Input
                  id='taxName'
                  placeholder='Enter tax name'
                  className='mt-1 w-full'
                  value={taxName}
                  onChange={e => setTaxName(e.target.value)} // Update state
                />
                {taxNameError.length ? (
                  <p className='text-red-600'>{taxNameError}</p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor='taxType'
                  className='mb-2 mt-2 block text-sm font-semibold text-black'
                >
                  Tax Type
                </label>
                <div className='relative mx-auto'>
                  <input
                    type='text'
                    className='w-full rounded-lg border border-gray-300 px-4 py-2'
                    placeholder='Search or add...'
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={() => setDropdownOpen(true)}
                  />

                  {dropdownOpen && (
                    <ul className='absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg'>
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item: any, index: any) => (
                          <li
                            key={index}
                            className='cursor-pointer px-4 py-2 hover:bg-gray-100'
                            onClick={() => handleSelect(item)}
                          >
                            {item.name}
                          </li>
                        ))
                      ) : (
                        <li
                          className='flex cursor-pointer flex-row px-4 py-2 hover:bg-gray-100'
                          onClick={handleAddNewItem}
                        >
                          <p className='text-[#ee6723]'>Add</p> - {searchTerm}
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor='taxRate'
                  className='mb-2 mt-2 block text-sm font-semibold text-black'
                >
                  Tax Rate (%)
                </label>
                {taxType === 'GST' ? (
                  <Select
                    value={taxRate} // Bind select to state
                    onValueChange={value =>
                      setTaxRate(Math.max(0, Number(value))?.toString())
                    } // Update state
                  >
                    <SelectTrigger className='mt-1 w-full'>
                      <SelectValue placeholder='Select tax type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='5'>5</SelectItem>
                      <SelectItem value='12'>12</SelectItem>
                      <SelectItem value='18'>18</SelectItem>
                      <SelectItem value='28'>28</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id='taxRate'
                    type='number'
                    placeholder='Enter tax rate'
                    className='mt-1 w-full'
                    value={taxRate}
                    onChange={e => {
                      const value = e.target.value
                      // Convert the value to a number, apply validation, and then convert it back to string
                      const sanitizedValue = Math.max(0, Number(value))
                      setTaxRate(sanitizedValue.toString()) // Update state with a valid positive number
                    }}
                  />
                )}
                {taxRateError.length ? (
                  <p className='text-red-600'>{taxRateError}</p>
                ) : null}
              </div>

              {taxType == 'GST' && (
                <div className='rounded-md bg-gray-100 p-4'>
                  <div>
                    <label
                      htmlFor='taxRate'
                      className='mb-2 mt-2 block text-sm font-semibold text-black'
                    >
                      CGST (%)
                    </label>

                    <Input
                      id='taxRate'
                      type='number'
                      placeholder='Enter tax rate'
                      className='mt-1 w-full'
                      value={cgst}
                      onChange={e => {
                        const value = e.target.value
                        // Convert the value to a number, apply validation, and then convert it back to string
                        const sanitizedValue = Math.max(0, Number(value))
                        setCgstTaxRate(sanitizedValue.toString()) // Update state with a valid positive number
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='taxRate'
                      className='mb-2 mt-2 block text-sm font-semibold text-black'
                    >
                      SGST (%)
                    </label>

                    <Input
                      id='taxRate'
                      type='number'
                      placeholder='Enter tax rate'
                      className='mt-1 w-full'
                      value={sgst}
                      onChange={e => {
                        const value = e.target.value
                        // Convert the value to a number, apply validation, and then convert it back to string
                        const sanitizedValue = Math.max(0, Number(value))
                        setSgstTaxRate(sanitizedValue.toString()) // Update state with a valid positive number
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='taxRate'
                      className='mb-2 mt-2 block text-sm font-semibold text-black'
                    >
                      IGST (%)
                    </label>

                    <Input
                      id='taxRate'
                      type='number'
                      placeholder='Enter tax rate'
                      className='mt-1 w-full'
                      value={igst}
                      onChange={e => {
                        const value = e.target.value
                        // Convert the value to a number, apply validation, and then convert it back to string
                        const sanitizedValue = Math.max(0, Number(value))
                        setIgstTaxRate(sanitizedValue.toString()) // Update state with a valid positive number
                      }}
                    />
                  </div>

                  {gstCalcError && (
                    <div className='pt-3 text-xs text-red-600'>
                      The CGST, SGST, and IGST should together equal the total
                      of the selected tax rate
                    </div>
                  )}
                </div>
              )}
              <div>
                <label
                  htmlFor='taxType'
                  className='mb-2 mt-2 block text-sm font-semibold text-black'
                >
                  Tax Note
                </label>
                <Textarea
                  placeholder='Enter tax note'
                  className='mt-1 w-full'
                  value={taxNote}
                  onChange={e => setTaxNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <div className='p-5'>
                <Button
                  type='button'
                  variant={'outline'}
                  className='w-[197px]'
                  onClick={() => {
                    setDropdownOpen(false)
                    setOpenModal(false)
                  }}
                >
                  <p>Cancel</p>
                </Button>
                <Button
                  type='button'
                  className='ml-5 w-[197px]'
                  onClick={handleAdd}
                >
                  <p>{id ? 'Update' : 'Add'}</p>{' '}
                  {/* Change button text based on action */}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AddNewTax
