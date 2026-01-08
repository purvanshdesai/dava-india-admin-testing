'use client'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { storeSettingsSchema } from '@/lib/zod'
import { fetchStoreSettings } from '@/utils/actions/storeSettings'
import { usePatchStoreSettings } from '@/utils/hooks/storeSettingsHook'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { getStoreAdminDetails } from '@/utils/actions/storeAdmin'
import { useClickOutside } from '@/hooks/useClickOutside'

const StoreSettings = () => {
  const updateOnSubmit = usePatchStoreSettings()

  const { toast } = useToast()
  const { data: session } = useSession()
  const storeId = session?.user.id
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [items, setItems] = useState<any>([])
  const [selectedItems, setSelectedItems] = useState<any>([])
  const [newName, setNewName] = useState<string>('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [editingItemName, setEditingItemName] = useState(null)
  const [editingItemEmail, setEditingItemEmail] = useState(null)
  const [editingItemPhone, setEditingItemPhone] = useState(null)
  const emailMobileDropDownRef = useRef<any>()

  useClickOutside(emailMobileDropDownRef, () => {
    setDropdownOpen(false)
  })
  const handleAddNameClick = (item: any) => {
    setEditingItemName(item._id)
    setNewName(item.fullName || '')
  }

  const handleAddEmailClick = (item: any) => {
    setEditingItemEmail(item._id)
    setNewEmail(item.email || '')
  }

  const handleAddPhoneClick = (item: any) => {
    setEditingItemPhone(item._id)
    setNewPhone(item.mobile || '')
  }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value)
  }
  const handleEmailChange = (e: any) => setNewEmail(e.target.value)
  const handlePhoneChange = (e: any) => setNewPhone(e.target.value)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const mobileRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value)
    setDropdownOpen(true)
  }

  const handleSelect = (item: any) => {
    if (selectedItems.some((selected: any) => selected._id === item._id)) {
      setSelectedItems(
        selectedItems.filter((selected: any) => selected._id !== item._id)
      )
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  // const filteredItems = items.filter((item: any) => {
  //   const searchLower = searchTerm.toLowerCase()

  //   if (item.type === 'email') {
  //     return item.email?.toLowerCase().includes(searchLower)
  //   } else if (item.type === 'mobile') {
  //     return item.mobile?.toLowerCase().includes(searchLower)
  //   }

  //   return false
  // })

  const filteredItems: any[] = []

  const handleAddNewItem = () => {
    const newItem: any = {
      _id: Date.now().toString(),
      type: emailRegex.test(searchTerm) ? 'email' : 'mobile',
      fullName: '',

      ...(emailRegex.test(searchTerm)
        ? { email: searchTerm }
        : { mobile: searchTerm })
    }

    setItems([...items, newItem])
    handleSelect(newItem)
    setSearchTerm('')
  }

  const isValidInput =
    emailRegex.test(searchTerm) || mobileRegex.test(searchTerm)
  function transformData(data: any) {
    const emailIds: any = []
    const phoneNumbers: any = []

    if (Array.isArray(data.assignee)) {
      data.assignee.forEach((item: any) => {
        if (item.medium === 'email' && item.email) {
          emailIds.push(item.email)
        } else if (item.medium === 'sms' && item.mobile) {
          phoneNumbers.push(item.mobile)
        }
      })
    }

    const result = {
      lockStockWarning: data.low_stock_threshold || '',
      outOfStockWarning: data.out_of_stock_threshold || '',
      emailIds: emailIds,
      phoneNumbers: phoneNumbers,
      lockStockWarningStatus: data.low_stock_threshold_status ?? false,
      outOfStockWarningStatus: data.out_of_stock_threshold_status ?? false
    }

    return result
  }
  const form = useForm<z.infer<typeof storeSettingsSchema>>({
    resolver: zodResolver(storeSettingsSchema),
    values: {
      lockStockWarning: '',
      outOfStockWarning: '',
      emailIds: [],
      phoneNumbers: [],
      lockStockWarningStatus: true,
      outOfStockWarningStatus: true
    }
  })
  // const formInstance = form as unknown as UseFormReturn
  const OnSubmit = async (data: z.infer<typeof storeSettingsSchema>) => {
    const assignee: any = selectedItems
    const payload: any = { ...data }

    delete payload.emailIds
    delete payload.phoneNumbers

    payload.assignee = assignee

    await updateOnSubmit.mutateAsync({
      _id: storeId,
      data: payload
    })
    toast({
      title: 'Success',
      description: 'Updated successfully'
    })
  }

  useEffect(() => {
    const fetchSettingsData = async () => {
      if (storeId) {
        try {
          const data = await fetchStoreSettings() // Fetch the coupon details from API
          const transformedData = transformData(data?.storeSettings)
          setSelectedItems(data?.storeSettings?.assignee)
          form.reset(transformedData) // Populate form with fetched data
        } catch (error) {
          console.error('Error fetching coupon data:', error)
        } finally {
          // setIsLoading(false)
        }
      } else {
        // setIsLoading(false)
      }
    }

    fetchSettingsData()
  }, [storeId])
  const handleRemove = (item: any) => {
    setSelectedItems(
      selectedItems.filter((selected: any) => selected._id !== item._id)
    )
  }
  const fetchStoreAdminDetails = async () => {
    const storeAdminsDetails = await getStoreAdminDetails()
    const details = storeAdminsDetails?.data.flatMap((user: any) => {
      const entries = []

      if (user.email) {
        entries.push({
          _id: user._id,
          type: 'email',
          email: user.email,
          fullName: user?.fullName ?? ''
        })
      }

      if (user.phoneNumber) {
        entries.push({
          _id: user._id,
          type: 'mobile',
          mobile: user.phoneNumber,
          fullName: user?.fullName ?? ''
        })
      }

      return entries
    })
    setItems(details)
  }

  useEffect(() => {
    fetchStoreAdminDetails()
  }, [])
  const handleSubmitName = () => {
    setSelectedItems((items: any) =>
      items.map((item: any) =>
        item._id === editingItemName ? { ...item, fullName: newName } : item
      )
    )
    setEditingItemName(null)
  }

  const handleSubmitEmail = () => {
    setSelectedItems((items: any) =>
      items.map((item: any) =>
        item._id === editingItemEmail ? { ...item, email: newEmail } : item
      )
    )
    setEditingItemEmail(null)
  }

  const handleSubmitPhone = () => {
    setSelectedItems((items: any) =>
      items.map((item: any) =>
        item._id === editingItemPhone ? { ...item, mobile: newPhone } : item
      )
    )
    setEditingItemPhone(null)
  }
  return (
    <div>
      <div className='xxl:px-8 hidden h-full flex-1 flex-col space-y-8 px-4 md:flex'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Notification Settings
          </h2>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(OnSubmit)}
            className='relative h-[90vh]'
          >
            {/* Low Stock Warning */}
            <div className='flex h-[113px] flex-row items-center justify-between rounded-md border bg-[#f9fbfd] p-3'>
              <div>
                <p className='text-xl font-semibold'>Low Stock Warning</p>
                <div className='flex flex-row items-center'>
                  <p className='text-md mr-3 font-medium'>
                    Specify warning number
                  </p>
                  <Input
                    {...form.register('lockStockWarning')} // Registering the input with form
                    id='lockStockWarning'
                    type='number'
                    className='mt-1 block w-full'
                    placeholder='Enter number'
                  />
                </div>
              </div>
              <div>
                <Switch
                  checked={form.watch('lockStockWarningStatus')} // Bind with the form state
                  onCheckedChange={
                    checked => form.setValue('lockStockWarningStatus', checked) // Update form state on switch change
                  }
                />
              </div>
            </div>

            {/* Out of Stock Warning */}
            <div className='mt-5 flex h-[113px] flex-row items-center justify-between rounded-md border bg-[#f9fbfd] p-3'>
              <div>
                <p className='text-xl font-semibold'>Out of Stock Warning</p>
                <div className='flex flex-row items-center'>
                  <p className='text-md mr-3 font-medium'>
                    Specify warning number
                  </p>
                  <Input
                    {...form.register('outOfStockWarning')}
                    id='outOfStockWarning'
                    type='number'
                    className='mt-1 block w-full'
                    placeholder='Enter number'
                  />
                </div>
              </div>
              <div>
                <Switch
                  checked={form.watch('outOfStockWarningStatus')}
                  onCheckedChange={checked =>
                    form.setValue('outOfStockWarningStatus', checked)
                  }
                />
              </div>
            </div>

            <div className='mt-5'>
              {selectedItems.length ? (
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Selected Emails & Phone Numbers
                  </label>
                  <div className='flex flex-wrap gap-2 rounded-lg border border-gray-300 p-4'>
                    {selectedItems.map((item: any) => (
                      <div
                        key={item._id}
                        className='flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 shadow-sm'
                      >
                        <div>
                          {/* Name Field */}
                          <p className='mb-5 text-sm font-semibold'>
                            {editingItemName === item._id ? (
                              <input
                                type='text'
                                value={newName}
                                onChange={handleNameChange}
                                className='rounded-lg border px-2 py-1 text-sm'
                                placeholder='Enter name'
                                onBlur={handleSubmitName} // Submit name on blur
                              />
                            ) : item?.fullName ? (
                              item?.fullName
                            ) : (
                              <div
                                className='cursor-pointer text-orange-800'
                                onClick={() => handleAddNameClick(item)}
                              >
                                +Add Name
                              </div>
                            )}
                          </p>

                          {/* Email Field */}
                          <p className='mb-5 text-xs text-gray-500'>
                            {editingItemEmail === item._id ? (
                              <input
                                type='email'
                                value={newEmail}
                                onChange={handleEmailChange}
                                className='rounded-lg border px-2 py-1 text-sm'
                                placeholder='Enter email'
                                onBlur={handleSubmitEmail} // Submit email on blur
                              />
                            ) : item?.email ? (
                              `Email: ${item.email}`
                            ) : (
                              <div
                                className='cursor-pointer text-orange-800'
                                onClick={() => handleAddEmailClick(item)}
                              >
                                +Add Email
                              </div>
                            )}
                          </p>

                          {/* Phone Field */}
                          <p className='text-xs text-gray-500'>
                            {editingItemPhone === item._id ? (
                              <input
                                type='text'
                                value={newPhone}
                                onChange={handlePhoneChange}
                                className='rounded-lg border px-2 py-1 text-sm'
                                placeholder='Enter phone number'
                                onBlur={handleSubmitPhone} // Submit phone on blur
                              />
                            ) : item.mobile ? (
                              `${item.mobile}`
                            ) : (
                              <div
                                className='cursor-pointer text-orange-800'
                                onClick={() => handleAddPhoneClick(item)}
                              >
                                +Add Phone No
                              </div>
                            )}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item)}
                          className='text-gray-500 hover:text-gray-700'
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className='relative mt-5 w-[50%]'>
                <label
                  className='mb-2 block font-semibold'
                  onClick={() => setDropdownOpen(false)}
                >
                  Assign mails & phone numbers for the notification
                </label>
                <label className='mb-2 block text-sm font-normal'>
                  Select email or phone number
                </label>
                <input
                  type='text'
                  className='w-full rounded-lg border border-gray-300 px-4 py-2'
                  placeholder='Enter mail or phone number'
                  value={searchTerm}
                  onChange={handleSearch}
                  onClick={() => setDropdownOpen(true)}
                />

                {dropdownOpen && (
                  <ul
                    ref={emailMobileDropDownRef}
                    className='absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg'
                  >
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item: any) => (
                        <li
                          key={item._id}
                          className='flex cursor-pointer items-center px-4 py-2 hover:bg-gray-100'
                        >
                          <input
                            type='checkbox'
                            checked={selectedItems.some(
                              (selected: any) => selected._id === item._id
                            )}
                            onChange={() => handleSelect(item)}
                            className='mr-2'
                          />
                          {/* Conditionally render based on item type */}
                          {item.type === 'email' ? (
                            <span>Email: {item.email}</span>
                          ) : item.type === 'mobile' ? (
                            <span>Mobile: {item.mobile}</span>
                          ) : (
                            <span>{item.name}</span>
                          )}
                        </li>
                      ))
                    ) : isValidInput ? (
                      <li
                        className='flex cursor-pointer flex-row px-4 py-2 hover:bg-gray-100'
                        onClick={handleAddNewItem}
                      >
                        <p className='text-[#ee6723]'>Add</p> - {searchTerm}
                      </li>
                    ) : (
                      <li className='px-4 py-2 text-gray-500'>
                        Invalid input (Email/Mobile only)
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className='absolute bottom-10 right-1'>
              <Button type='submit' className='mt-4'>
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default StoreSettings
