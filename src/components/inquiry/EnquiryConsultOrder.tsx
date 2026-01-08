'use client'
// import Footer from '@/components/Footer'
import AddAssociatedProductsModal from '@/components/products/ProductDetails/AddAssociatedProductsModal'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
// import { useFooter } from '@/context/Footer'
import { cn } from '@/lib/utils'
import { consultationSchema } from '@/lib/zod'
import {
  useCreateConsultation,
  useGetConsultationFromTicket
} from '@/utils/hooks/consultationHooks'
import { useFetchTicketDetails } from '@/utils/hooks/ticketHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { CalendarIcon, Loader2Icon, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'

const vitals: any[] = [
  {
    name: 'vitals.height',
    label: 'Height (cm)',
    type: 'number'
  },
  {
    name: 'vitals.weight',
    label: 'Weight (kg)',
    type: 'number'
  },
  {
    name: 'vitals.bloodPressure',
    label: 'Blood Pressure (mmHg)',
    type: 'text' // Accept string like '120/90'
  },
  {
    name: 'vitals.temperature',
    label: 'Temperature (C)',
    type: 'number'
  }
]
// const severity = ['mild', 'moderate', 'extreme']
const severity = [
  {
    value: 'mild',
    label: 'Mild'
  },
  {
    value: 'moderate',
    label: 'Moderate'
  },
  {
    value: 'extreme',
    label: 'Extreme'
  }
]

export default function ConsultingOrder({
  params
}: {
  params: { inquiryId: string }
}) {
  const ticket = params?.inquiryId
  const { data: ticketDetails, isPending } = useFetchTicketDetails(ticket)
  // const { setFooterContent } = useFooter()
  const { mutateAsync: saveDetails, isPending: isSubmitting } =
    useCreateConsultation()

  const router = useRouter()
  const { toast } = useToast()

  const { data: consultation, isPending: isPendingConsultation } =
    useGetConsultationFromTicket(ticket)

  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      note: '',
      vitals: {
        bloodPressure: 0,
        height: 0,
        temperature: 0,
        weight: 0
      },
      provisionalDiagnosis: [
        {
          concern: '',
          duration: '',
          severity: ''
        }
      ],
      chiefComplains: [
        {
          concern: '',
          duration: '',
          severity: ''
        }
      ],
      medicines: [],
      prescriptionExpiryDate: new Date()
    }
  })
  const provisionalDiagnosisField = useFieldArray({
    control: form.control,
    name: 'provisionalDiagnosis'
  })
  const prescribedMedicinesField = useFieldArray({
    control: form.control,
    name: 'medicines'
  })
  const chiefComplainsField = useFieldArray({
    control: form.control,
    name: 'chiefComplains'
  })

  const handleAddProduct = (products: any) => {
    const newSelected: any[] = []
    for (const product of products) {
      const selectedProducts = form.getValues('medicines')
      const selected = selectedProducts.find(
        item => item?.product == product?._id
      )
      if (selected) {
        newSelected.push(selected)
      } else {
        newSelected.push({
          productId: product?._id,
          quantity: 1,
          note: '',
          product,
          dosage: {
            timesPerDay: 0,
            noOfDays: 0,
            beforeFood: false,
            afterFood: false,
            morning: false,
            afternoon: false,
            night: false,
            sos: false
          }
        })
      }
    }
    const prevMedicines = form.getValues('medicines')
    form.setValue('medicines', [...prevMedicines, ...newSelected])
  }
  const submitAddConsultation = async (
    values: z.infer<typeof consultationSchema>
  ) => {
    try {
      if (isPending) {
        toast({
          title: 'Please wait...',
          description:
            'The request has already been submitted, The prescription is being generated'
        })
        return
      }

      await saveDetails({
        ...values,
        medicines: values?.medicines?.map(item => ({
          productId: item?.productId,
          quantity: item?.quantity,
          note: item?.note,
          dosage: item?.dosage
        })),
        ticket
      })
      router.back()
    } catch (error) {
      throw error
    }
  }
  const cancelPress = () => {
    router.back()
  }

  // useEffect(() => {
  //   setFooterContent(
  //     <Footer
  //       onSubmit={form.handleSubmit(submitAddConsultation)}
  //       onBack={cancelPress}
  //       submitting={createMutation.isPending}
  //     />
  //   )
  //   return () => {
  //     setFooterContent(null)
  //   }
  // }, [])

  useEffect(() => {
    if (consultation) {
      if (consultation?.medicines?.length) {
        form.setValue(
          'medicines',
          consultation?.medicines?.map((item: any) => ({
            ...item,
            productId: item?.productId?._id,
            product: item?.productId
          }))
        )
      }
    }
  }, [consultation])

  if (isPending || isPendingConsultation) {
    return <div>Loading</div>
  }

  return (
    <div>
      <h1 className='py-4 text-lg font-medium'>Create New Order</h1>
      <Form {...form}>
        <form>
          <div className='mb-5 w-full rounded-lg border border-[#D1D1D1]'>
            <div className='p-4'>
              <div className='border-b pb-3'>
                <div className='pb-2'>
                  <h1 className='font-bold'>General Info</h1>
                </div>
                <div className='flex justify-between gap-8'>
                  {/* <div className='w-full'>
                  <h1 className='pb-3'>Doctor Info</h1>
                  <div className='rounded-md border border-[#CACACA] bg-[#F9FBFD] p-4'>
                    <div className='flex flex-col'>
                      <div>Dr Swathi</div>
                      <div>MBBS,MD</div>
                      <div>Family physician | KMC Registration No: 1567890</div>
                      <div>Main Road,Sreenagar</div>
                    </div>
                  </div>
                </div> */}
                  <div className='w-[30%]'>
                    <h1 className='pb-2'>Appointment Info</h1>
                    <div className='rounded-md border border-[#CACACA] bg-[#F9FBFD] p-2 text-sm'>
                      <div className='flex w-[90%] flex-col'>
                        <div className='grid grid-cols-2'>
                          <div>Patient:</div>
                          <div>{ticketDetails?.patientId?.name}</div>
                        </div>
                        <div className='grid grid-cols-2'>
                          <div>Contact No:</div>
                          <div>{ticketDetails?.patientId?.phoneNumber}</div>
                        </div>
                        <div className='grid grid-cols-2'>
                          <div>Consultation Type:</div>
                          <div>Online</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='py-3'>
                <h1 className='pb-4 text-sm font-bold'>Prescription Info</h1>
                <div className='grid grid-cols-2 gap-4'>
                  {vitals?.map((vital: any, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={vital?.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{vital?.label}</FormLabel>
                          <FormControl>
                            <Input
                              className='w-full'
                              type={vital.type || 'number'}
                              value={
                                vital.name === 'vitals.bloodPressure'
                                  ? field.value !== undefined &&
                                    field.value !== null
                                    ? String(field.value)
                                    : ''
                                  : field.value
                              }
                              onChange={e => {
                                if (vital.name === 'vitals.bloodPressure') {
                                  // Accept any string, but if it's a number, keep as number for backward compatibility
                                  const val = e.target.value
                                  // If empty, set as empty string
                                  if (val === '') {
                                    field.onChange('')
                                  } else if (/^\d+$/.test(val)) {
                                    // If only digits, keep as number (old data)
                                    field.onChange(Number(val))
                                  } else {
                                    // Otherwise, keep as string (new format like '120/90')
                                    field.onChange(val)
                                  }
                                } else {
                                  if (e.target.value) {
                                    field.onChange(Number(e.target.value))
                                  } else {
                                    field.onChange('')
                                  }
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className='py-3'>
                <h1 className='pb-3 font-bold'>Chief Complains</h1>
                <div>
                  <div className='rounded-md border bg-[#F9FBFD] p-4'>
                    {chiefComplainsField.fields.map((field, index) => (
                      <div key={field.id}>
                        <div className='pb-5 pt-3'>
                          <FormField
                            control={form.control}
                            name={`chiefComplains.${index}.concern` as const}
                            render={({ field }) => (
                              <FormItem>
                                <div className='flex items-center justify-between'>
                                  <FormLabel className='capitalize'>
                                    Concern {index + 1}
                                  </FormLabel>
                                  <div
                                    className='cursor-pointer'
                                    onClick={() =>
                                      chiefComplainsField.remove(index)
                                    }
                                  >
                                    <Trash2 color='red' size={20} />
                                  </div>
                                </div>
                                <FormControl>
                                  <Input className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-6'>
                          <FormField
                            control={form.control}
                            name={`chiefComplains.${index}.duration` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='capitalize'>
                                  Duration
                                </FormLabel>
                                <FormControl>
                                  <Input className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`chiefComplains.${index}.severity` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='capitalize'>
                                  Severity
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder='Select complaint severity' />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {severity?.map((item, index) => (
                                      <SelectItem
                                        key={index}
                                        value={item.value}
                                      >
                                        {item.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      onClick={() => {
                        chiefComplainsField.append({
                          concern: '',
                          duration: '',
                          severity: ''
                        })
                      }}
                      className='mt-4'
                    >
                      Add Concern
                    </Button>
                  </div>
                </div>
              </div>
              <div className='py-3'>
                <h1 className='pb-3 font-bold'>Provisional Diagnosis</h1>
                <div>
                  <div className='rounded-md border bg-[#F9FBFD] p-4'>
                    {provisionalDiagnosisField.fields.map((field, index) => (
                      <div key={field.id}>
                        <div className='pb-5 pt-3'>
                          <FormField
                            control={form.control}
                            name={
                              `provisionalDiagnosis.${index}.concern` as const
                            }
                            render={({ field }) => (
                              <FormItem>
                                <div className='flex items-center justify-between'>
                                  <FormLabel className='capitalize'>
                                    Diagnosis {index + 1}
                                  </FormLabel>
                                  <div
                                    className='cursor-pointer'
                                    onClick={() =>
                                      provisionalDiagnosisField.remove(index)
                                    }
                                  >
                                    <Trash2 color='red' size={20} />
                                  </div>
                                </div>
                                <FormControl>
                                  <Input className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-6'>
                          <FormField
                            control={form.control}
                            name={
                              `provisionalDiagnosis.${index}.duration` as const
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='capitalize'>
                                  Duration
                                </FormLabel>
                                <FormControl>
                                  <Input className='w-full' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={
                              `provisionalDiagnosis.${index}.severity` as const
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='capitalize'>
                                  Severity
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder='Select diagnosis severity' />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {severity?.map((item, index) => (
                                      <SelectItem
                                        key={index}
                                        value={item.value}
                                      >
                                        {item.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      onClick={() => {
                        provisionalDiagnosisField.append({
                          concern: '',
                          duration: '',
                          severity: ''
                        })
                      }}
                      className='mt-4'
                    >
                      Add Diagnosis
                    </Button>
                  </div>
                </div>
              </div>
              {form.getFieldState('medicines').error ? (
                <div className='text-red-500'>
                  {form.getFieldState('medicines').error?.message}
                </div>
              ) : null}
              <div className='mt-4 rounded border bg-[#F9FBFD]'>
                <div className='flex h-[68px] items-center gap-4 pl-4'>
                  <h1 className='font-bold'>Prescribed Medicines</h1>
                  <AddAssociatedProductsModal
                    AddProduct={(value: any) => handleAddProduct(value)}
                    alreadyExistProductIds={form
                      .getValues('medicines')
                      .map(item => item.productId)}
                    orderPlaced={consultation.orderPlaced}
                  />
                </div>
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow className='font-semibold'>
                        <TableHead className='w-[100px] border-collapse border font-bold text-black'>
                          Medicine Name
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          Quantity
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          Times/Day
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          No of days
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          Before Food
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          After Food
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          Morning
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          Afternoon
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          Night
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          SOS
                        </TableHead>
                        <TableHead className='border-collapse border font-bold text-black'>
                          Delete
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescribedMedicinesField.fields.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className='flex border-collapse flex-col gap-2 border border-[#CACACA]'>
                            <div className='font-bold'>
                              {item.product?.title}
                            </div>
                            <div>{item.product?.compositions}</div>
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={`medicines.${index}.quantity` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      className='w-full'
                                      type='number'
                                      min={1}
                                      disabled={consultation.orderPlaced}
                                      value={field.value}
                                      onChange={e => {
                                        console.log(e.target.value)
                                        if (e.target.value) {
                                          field.onChange(Number(e.target.value))
                                        } else {
                                          field.onChange('')
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={
                                `medicines.${index}.dosage.timesPerDay` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      className='w-full'
                                      type='number'
                                      min={0}
                                      value={field.value}
                                      onChange={e => {
                                        console.log(e.target.value)
                                        if (e.target.value) {
                                          field.onChange(Number(e.target.value))
                                        } else {
                                          field.onChange('')
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={
                                `medicines.${index}.dosage.noOfDays` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      className='w-full'
                                      type='number'
                                      min={0}
                                      value={field.value}
                                      onChange={e => {
                                        console.log(e.target.value)
                                        if (e.target.value) {
                                          field.onChange(Number(e.target.value))
                                        } else {
                                          field.onChange('')
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={
                                `medicines.${index}.dosage.beforeFood` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={
                                `medicines.${index}.dosage.afterFood` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={
                                `medicines.${index}.dosage.morning` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={
                                `medicines.${index}.dosage.afternoon` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={`medicines.${index}.dosage.night` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <FormField
                              control={form.control}
                              name={`medicines.${index}.dosage.sos` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className='border-collapse border border-[#CACACA]'>
                            <Trash2
                              color={'red'}
                              onClick={() => {
                                if (consultation.orderPlaced) return
                                prescribedMedicinesField.remove(index)
                              }}
                              className={
                                consultation.orderPlaced
                                  ? `cursor-not-allowed`
                                  : `cursor-pointer`
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className='mt-8'>
                <div className={'font-semibold'}>Due Date :</div>
                <div>
                  <FormField
                    control={form.control}
                    name={`prescriptionExpiryDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger
                              className='dark:border-gray-900'
                              asChild
                            >
                              <Button
                                variant={'datepicker'}
                                className={cn(
                                  'w-64 justify-start text-left font-normal dark:bg-black dark:text-gray-300'
                                )}
                              >
                                {dayjs(field.value).format('DD-MM-YYYY')}
                                <CalendarIcon className='ml-auto h-4 w-4' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                              <Calendar
                                mode='single'
                                selected={field.value}
                                // onSelect={date => field.onChange(date)}
                                onSelect={date => field.onChange(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className={'flex h-full items-center justify-end gap-4 p-5'}>
              <Button
                className={
                  'w-24 border border-orange-500 bg-white text-center text-orange-500'
                }
                type='button'
                onClick={() => cancelPress()}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                className={'w-24 text-center'}
                type='button'
                onClick={() => submitAddConsultation(form.getValues())}
              >
                {isSubmitting ? (
                  <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Save
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
