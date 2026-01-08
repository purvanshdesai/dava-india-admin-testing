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
import { Checkbox } from '../ui/checkbox'
import {
  useAllTaxes,
  usePatchTax,
  useSubmitAddTax
} from '@/utils/hooks/taxesHooks'
import { useToast } from '@/hooks/use-toast'
import { handleGetTax } from '@/utils/actions/taxesActions'

const AddTaxGroupName = ({ label = 'Add Tax Group Name', id }: any) => {
  const [groupName, setGroupName] = useState('')
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([])
  const { data: taxes }: any = useAllTaxes({})
  const [openModal, setOpenModal] = useState(false)
  const [, setEditDetails] = useState<any>(null)
  const handleSubmitTax = useSubmitAddTax()
  const { toast } = useToast()
  const patchTaxMutation = usePatchTax()

  const handleCheckboxChange = (id: string) => {
    setSelectedTaxes(prev =>
      prev.includes(id) ? prev.filter(tax => tax !== id) : [...prev, id]
    )
  }

  const calculateTotalRate = () => {
    return taxes?.data
      .filter((tax: any) => selectedTaxes.includes(tax._id))
      .reduce((total: number, tax: any) => total + Number(tax.rate), 0)
  }
  const [loading, setLoading] = useState(false)
  const handleAddClick = async () => {
    try {
      setLoading(true)
      // Validation
      if (!groupName.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter a group name.'
        })
        return
      }

      if (selectedTaxes.length === 0) {
        toast({
          title: 'Error',
          description: 'Please select at least one tax.'
        })
        return
      }

      const totalRate = calculateTotalRate()

      if (label === 'Edit') {
        await patchTaxMutation.mutateAsync({
          taxId: id,
          data: {
            name: groupName,
            category: 'group',
            groups: selectedTaxes,
            type: 'group',
            rateType: 'percentage',
            rate: totalRate.toString()
          }
        })
        setOpenModal(false)
        toast({
          title: 'Success',
          description: 'Updated successfully'
        })
      } else {
        await handleSubmitTax.mutateAsync({
          name: groupName,
          category: 'group',
          groups: selectedTaxes,
          type: 'group',
          rateType: 'percentage',
          rate: totalRate.toString()
        })
        setOpenModal(false)
        setSelectedTaxes([])
        setGroupName('')
        toast({
          title: 'Success',
          description: 'Added successfully'
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data and populate form with editDetails if id is provided
  async function fetch() {
    if (id) {
      const response = await handleGetTax(id)
      setEditDetails(response)
      setGroupName(response.name) // Populate groupName
      setSelectedTaxes(response.groups || []) // Populate selectedTaxes with groups from editDetails
    }
  }

  useEffect(() => {
    fetch()
  }, [id])

  return (
    <div>
      <Dialog open={openModal}>
        <DialogTrigger>
          {label === 'Edit' ? (
            <div>Edit</div>
          ) : (
            <Button
              size='sm'
              className='flex items-center gap-2'
              variant={'outline'}
              onClick={() => setOpenModal(true)}
            >
              {label}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tax Group Name</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='groupName'
                className='block text-sm font-medium text-gray-700'
              >
                Group Name
              </label>
              <Input
                id='groupName'
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder='Enter group name'
                className='mt-1 w-full'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Select Taxes
              </label>
              <div className='mt-2 h-[30vh] space-y-2 overflow-auto'>
                {taxes?.data.map((tax: any) => (
                  <div
                    key={tax._id}
                    className='flex flex-row items-center justify-between border-b p-3'
                  >
                    <div className='flex flex-row items-center justify-center'>
                      <Checkbox
                        id={tax._id}
                        checked={selectedTaxes.includes(tax._id)} // Check if the tax is in selectedTaxes
                        onCheckedChange={() => handleCheckboxChange(tax._id)}
                      />
                      <label
                        htmlFor={tax._id}
                        className='ml-2 text-sm text-gray-700'
                      >
                        {tax.name}
                      </label>
                    </div>

                    <p>{tax.rate}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className='p-5'>
              <Button
                type='button'
                variant={'outline'}
                className='w-[197px]'
                onClick={() => {
                  setSelectedTaxes([])
                  setGroupName('')
                  setOpenModal(false)
                }}
              >
                <p>Cancel</p>
              </Button>
              <Button
                type='button'
                className='ml-5 w-[197px]'
                loader={loading}
                onClick={handleAddClick}
              >
                <p>{id ? 'Update' : 'Add'}</p>{' '}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddTaxGroupName
