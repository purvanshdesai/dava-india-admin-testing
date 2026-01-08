'use client'
import FormInputField from '@/components/form/FormInputField'
import { Form, FormLabel } from '@/components/ui/form'
import { couponSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import FormSelectField from '@/components/form/FormSelectField'
import FormDatePicker from '@/components/form/FormDatePicker'
import { Button } from '@/components/ui/button'
import {
  createCoupon,
  fetchCouponDetails,
  updateCoupon
} from '@/utils/actions/couponActions'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AppBreadcrumb from '@/components/Breadcrumb'
import { toast } from '@/hooks/use-toast'
import FormSwitchField from '../form/FormSwitchField'
import FormComboboxField from '../form/FormComboboxField'
import { useGetDeliveryPolices } from '@/utils/hooks/deliveryPolicyHooks'
import { useFetchProducts } from '@/utils/hooks/productHooks'
import { useFetchCollections } from '@/utils/hooks/collectionsHooks'
import FieldDialog from './BulkEmailPhoneDailog'

export type TCouponForm = z.infer<typeof couponSchema>
export default function CouponsForm({
  params
}: {
  params: { couponId: string }
}) {
  const router = useRouter()
  const couponId = params.couponId
  const [loading, setLoading] = useState(false)
  const [loader, setLoader] = useState(false)
  const [couponName, setCouponName] = useState('')

  const searchParams = useSearchParams()

  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  const { data: deliveryPolices, isLoading: isDeliveryPoliciesLoading } =
    useGetDeliveryPolices({
      $limit: 100,
      $skip: 0
    })

  const { data: products, isLoading: isProductsLoading } = useFetchProducts({
    $limit: 2000,
    $skip: 0
  }) as any

  const { data: categoriesDetails, isLoading: isCategoriesLoading } =
    useFetchCollections({
      $limit: 100,
      $skip: 0,
      filters: [{ id: 'type', value: 'subCategory' }]
    }) as any

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      couponName: '',
      description: '',
      couponCode: '',
      discountType: '',
      customUsageLimit: false,
      usageLimit: '',
      discountValue: 0,
      maximumDiscountValue: 0,
      minimumPurchaseValue: 0,
      products: [],
      collections: [],
      channels: 'both',
      forEmails: [],
      forPhoneNos: [],
      active: true,
      startDate: null,
      expiryDate: null,
      archive: false,
      forUserType: '',
      deliveryPolicies: [],
      isOfflineCoupon: false
    }
  })
  const formInstance = form as unknown as UseFormReturn
  const discountType = form.watch('discountType')
  const customUsageLimit = form.watch('customUsageLimit')

  let coupon: any = {}
  useEffect(() => {
    const fetchCouponData = async () => {
      if (couponId) {
        setLoading(true)
        try {
          coupon = await fetchCouponDetails(couponId) // Fetch the coupon details from API

          const convertedData = {
            ...coupon,
            usageLimit: customUsageLimit
              ? Number(coupon?.usageLimit)
              : coupon?.usageLimit,
            startDate: coupon.startDate ? new Date(coupon.startDate) : null,
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate) : null
          }
          setCouponName(coupon.couponName)
          form.reset(convertedData) // Populate form with fetched data
        } catch (error) {
          console.error('Error fetching coupon data:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchCouponData()
  }, [couponId])

  const onSubmit = async (data: z.infer<typeof couponSchema>) => {
    try {
      setLoader(true)

      const isUpdate = couponId !== 'new'
      const requestData = {
        ...data,
        usageLimit: customUsageLimit
          ? Number(data?.usageLimit)
          : data?.usageLimit,
        archive: false,
        ...(isUpdate ? { updatedAt: new Date() } : { createdAt: new Date() })
      }

      if (couponId !== 'new') {
        await updateCoupon({ _id: couponId, ...requestData })
        toast({
          title: 'Success',
          description: 'Updated successfully'
        })
      } else {
        await createCoupon(requestData)
        toast({
          title: 'Success',
          description: 'Created successfully'
        })
      }
      router.push(`/coupons?page=${page}&limit=${limit}`)
    } catch (error) {
      console.error('Error creating coupon:', error)
    } finally {
      setLoader(false)
    }
  }

  return (
    <>
      <div className='hidden h-full flex-1 flex-col space-y-8 md:flex'>
        <div className='border-b pb-4 dark:border-gray-600'>
          <AppBreadcrumb
            locations={[
              { page: 'Coupons', href: '/coupons' },
              {
                page: couponId !== 'new' ? (couponName ?? '') : 'Add New Coupon'
              }
            ]}
          />
        </div>

        {/* <div className='pb-2 text-lg'>Coupon Information</div> */}

        <div className=''>
          {!loading &&
            !isCategoriesLoading &&
            !isProductsLoading &&
            !isDeliveryPoliciesLoading && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className='relative flex h-fit flex-col gap-3'>
                    <div className='grid grid-cols-2 gap-8 pb-20'>
                      <FormInputField
                        formInstance={formInstance}
                        name={'couponName'}
                        label={'Coupon Name'}
                        placeholder={'Enter Coupon Name'}
                        isSmall={true}
                        isReq={true}
                      />
                      <FormInputField
                        formInstance={formInstance}
                        name={'couponCode'}
                        label={'Coupon Code'}
                        placeholder={'Enter Coupon Code'}
                        isSmall={true}
                        isReq={true}
                      />
                      <FormInputField
                        formInstance={form as unknown as UseFormReturn}
                        name={'description'}
                        label={'Description'}
                        placeholder={'Enter Description'}
                        isSmall={true}
                      />
                      <FormSelectField
                        formInstance={form as unknown as UseFormReturn}
                        isSmall={true}
                        isReq={true}
                        label={'Discount Type'}
                        name={'discountType'}
                        placeholder={'Select Type'}
                        items={[
                          { value: 'percentage', label: 'Percentage' },
                          { value: 'fixedAmount', label: 'Fixed Amount' }
                        ]}
                      />
                      <FormSelectField
                        formInstance={form as unknown as UseFormReturn}
                        isSmall={true}
                        isReq={true}
                        label={'Coupon Eligibility Type'}
                        name={'forUserType'}
                        placeholder={'Select Type'}
                        items={[
                          { value: 'firstTimeUser', label: 'First Time User' },
                          { value: 'repeatedUser', label: 'Repeated User' },
                          { value: 'common', label: 'Common' }
                        ]}
                      />
                      <FormSwitchField
                        isSmall={true}
                        name={'customUsageLimit'}
                        formInstance={form as unknown as UseFormReturn}
                        label={'Custom Usage Limit'}
                      />
                      {customUsageLimit ? (
                        <FormInputField
                          isSmall={true}
                          formInstance={form as unknown as UseFormReturn}
                          name={'usageLimit'}
                          label={'Usage Limit'}
                          type={'number'}
                          isReq={true}
                        />
                      ) : (
                        <FormSelectField
                          formInstance={form as unknown as UseFormReturn}
                          isSmall={true}
                          isReq={true}
                          label={'Usage Limit'}
                          name={'usageLimit'}
                          placeholder={'Select Usage Limit'}
                          items={[
                            { value: 'oneTime', label: 'One Time' },
                            { value: 'unlimited', label: 'Unlimited' }
                          ]}
                        />
                      )}
                      <FormInputField
                        formInstance={formInstance}
                        isReq={true}
                        name={'discountValue'}
                        label={
                          discountType == 'percentage'
                            ? 'Discount Percentage'
                            : 'Discount Value'
                        }
                        placeholder={'Enter Discount Value'}
                        isSmall={true}
                      />
                      {discountType == 'percentage' && (
                        <FormInputField
                          formInstance={formInstance}
                          isReq={true}
                          name={'maximumDiscountValue'}
                          label={'Maximum Discount Value'}
                          placeholder={'Enter Maximum Discount Value'}
                          isSmall={true}
                        />
                      )}
                      <FormInputField
                        formInstance={formInstance}
                        isReq={true}
                        name={'minimumPurchaseValue'}
                        label={'Minimum Purchase Value'}
                        placeholder={'Enter Minimum Purchase Value'}
                        isSmall={true}
                      />
                      <FormDatePicker
                        formInstance={form as unknown as UseFormReturn}
                        // isReq={true}
                        label='Start Date'
                        name='startDate'
                        placeholder='Select a date'
                        isSmall={true}
                        showRadioOption={true}
                      />
                      <FormDatePicker
                        formInstance={form as unknown as UseFormReturn}
                        // isReq={true}
                        label='Expiry Date'
                        name='expiryDate'
                        placeholder='Select a date'
                        isSmall={true}
                        showRadioOption={true}
                      />
                      <FormComboboxField
                        multiple={true}
                        isSmall={true}
                        formInstance={form as unknown as UseFormReturn}
                        label={'Products'}
                        name={'products'}
                        items={(products?.data ?? [])?.map((c: any) => ({
                          label: c.title,
                          value: c._id
                        }))}
                        className={'w-full'}
                      />
                      <FormComboboxField
                        multiple={true}
                        isSmall={true}
                        formInstance={form as unknown as UseFormReturn}
                        label={'Collections'}
                        name={'collections'}
                        items={(categoriesDetails?.data ?? [])?.map(
                          (c: any) => ({
                            label: c.name,
                            value: c._id
                          })
                        )}
                        className={'w-full'}
                      />
                      <FormComboboxField
                        multiple={true}
                        isSmall={true}
                        formInstance={form as unknown as UseFormReturn}
                        label={'Delivery Policies'}
                        name={'deliveryPolicies'}
                        items={deliveryPolices?.data?.map((c: any) => ({
                          label: c.zoneName,
                          value: c._id
                        }))}
                        className={'w-full'}
                      />

                      <div className='flex flex-col gap-2'>
                        <FormLabel className='text-sm text-black dark:text-gray-300'>
                          Email
                        </FormLabel>
                        <FieldDialog
                          label='Emails'
                          name='forEmails'
                          type='email'
                          formInstance={form as unknown as UseFormReturn}
                        />
                      </div>

                      <div className='flex flex-col gap-2'>
                        <FormLabel className='text-sm text-black dark:text-gray-300'>
                          Phone
                        </FormLabel>
                        <FieldDialog
                          label='Phone Numbers'
                          name='forPhoneNos'
                          type='phone'
                          formInstance={form as unknown as UseFormReturn}
                        />
                      </div>

                      <FormSelectField
                        formInstance={form as unknown as UseFormReturn}
                        isSmall={true}
                        isReq={true}
                        label={'Channels'}
                        name={'channels'}
                        placeholder={'Select Channel'}
                        items={[
                          { value: 'webApp', label: 'Web App' },
                          { value: 'mobileApp', label: 'Mobile App' },
                          { value: 'both', label: 'Both' }
                        ]}
                      />
                      <FormSwitchField
                        isSmall={true}
                        name={'isOfflineCoupon'}
                        formInstance={form as unknown as UseFormReturn}
                        label={'Is Offline Coupon'}
                      />
                    </div>

                    <div className='sticky bottom-0 left-0 w-full py-2 pr-3'>
                      <div className='flex justify-end gap-[20px]'>
                        <Button
                          type='button'
                          className={
                            'w-24 border border-orange-500 bg-white text-center text-orange-500'
                          }
                          onClick={() => router.back()}
                        >
                          Cancel
                        </Button>
                        <Button
                          type='submit'
                          loader={loader}
                          className={'w-24 text-center'}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            )}
        </div>
      </div>
    </>
  )
}
