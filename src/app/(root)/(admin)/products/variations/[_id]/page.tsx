'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useFooter } from '@/context/Footer'
import { ReactNode, useEffect, useState } from 'react'
import {
  useCreateProductsVariation,
  useDeleteProduct,
  useFetchVariationDetailsById,
  usePatchVariation
} from '@/utils/hooks/productHooks'
import {
  useParams,
  redirect,
  useRouter,
  useSearchParams
} from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  CrossCircledIcon,
  DotsHorizontalIcon,
  TrashIcon
} from '@radix-ui/react-icons'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import AppBreadcrumb from '@/components/Breadcrumb'
import AlertBox from '@/components/AlertBox'

export default function EditProductPage() {
  const params = useParams<{ _id: string }>()
  const searchParams = useSearchParams()
  const { setFooterContent } = useFooter()

  const { data, isPending } = useFetchVariationDetailsById(params._id, true)

  const page = searchParams.get('page') ?? ''
  const limit = searchParams.get('limit') ?? ''

  const setFooter = (content: ReactNode) => {
    setFooterContent(content)
  }

  useEffect(() => {
    return () => {
      setFooter(null)
    }
  }, [])

  if (isPending)
    return (
      <div>
        <LoadingSpinner />
      </div>
    )

  console.log('variation details ====== ', data)

  return (
    <div>
      <div className='border-b pb-4 dark:border-gray-600'>
        <AppBreadcrumb
          locations={[
            { page: 'Products', href: '/products' },
            {
              page: data ? (data?._id ?? '') : 'Add new variation'
            }
          ]}
        />
      </div>
      <VariationForm
        variationDetails={data}
        setFooter={setFooter}
        pagination={{ page, limit }}
      />
    </div>
  )
}

const VariationForm = ({
  variationDetails,
  setFooter,
  pagination
}: {
  variationDetails: any
  setFooter: any
  pagination: { page: string; limit: string }
}) => {
  const { page, limit } = pagination
  const { toast } = useToast()
  const {
    mutate: createVariation,
    isSuccess: isCreateSuccess,
    isPending: isCreatePending,
    data: createdData
  } = useCreateProductsVariation()
  const {
    mutate: patchVariation,
    isSuccess: isPatchSuccess,
    isPending: isPatchPending
  } = usePatchVariation()
  const {
    mutate: deleteProduct,
    isSuccess: isDeleteSuccess,
    isPending: isDeletePending,
    data: deletedData
  } = useDeleteProduct()

  const [variationCategories, setVariationCategories] = useState<string[]>(
    variationDetails?.variationCategories ?? []
  )
  const [variationCategoryValues, setVariationCategoryValues] = useState<
    Record<string, string[]>
  >(variationDetails?.variationCategoryValues ?? {})
  const [categoryInput, setCategoryInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(
    variationDetails?.variationCategories?.length
      ? variationDetails?.variationCategories[0]
      : ''
  )
  const [categoryValueInput, setCategoryValueInput] = useState('')
  const [variationProducts, setVariationProducts] = useState<any[]>(
    variationDetails?.products ?? []
  )

  const addVariationCategory = () => {
    if (!categoryInput.trim()) return
    setVariationCategories([...variationCategories, categoryInput])
    setCategoryInput('')
    if (!selectedCategory) setSelectedCategory(categoryInput)
  }

  const addVariationCategoryValue = () => {
    if (!categoryValueInput.trim()) return
    const categoryValues = variationCategoryValues[selectedCategory] || []
    setVariationCategoryValues({
      ...variationCategoryValues,
      [selectedCategory]: [...categoryValues, categoryValueInput]
    })
    setCategoryValueInput('')
  }

  const removeCategoryValue = (category: string, value: string) => {
    const categoryValues = variationCategoryValues[category]
    const newCategoryValues = categoryValues.filter(
      (val: string) => val !== value
    )
    setVariationCategoryValues({
      ...variationCategoryValues,
      [category]: newCategoryValues
    })
  }

  const removeCategory = (category: string) => {
    const newCategories = variationCategories.filter(cat => cat !== category)
    setVariationCategories(newCategories)
    const newCategoryValues = {
      ...variationCategoryValues
    }
    delete newCategoryValues[category]
    setVariationCategoryValues(newCategoryValues)

    if (selectedCategory === category) {
      setSelectedCategory(newCategories[0])
    }
  }

  const onSubmit = () => {
    if (variationDetails?._id) {
      patchVariation({
        _id: variationDetails?._id,
        variationCategories,
        variationCategoryValues
      })
    } else {
      createVariation({
        _id: variationDetails?._id,
        variationCategories,
        variationCategoryValues
      })
    }
  }

  const deleteProductById = async (productId: string) => {
    deleteProduct(productId)
  }

  useEffect(() => {
    setFooter(<Footer onSubmit={onSubmit} tab={'variations'} />)
  }, [variationCategories, variationCategoryValues])

  useEffect(() => {
    if (isPatchSuccess)
      toast({
        title: 'Success',
        description: 'Product updated successfully'
      })

    if (isCreateSuccess) redirect(`/products/variations/${createdData._id}`)
  }, [isCreateSuccess, isPatchSuccess])

  useEffect(() => {
    if (isDeleteSuccess) {
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      })

      setVariationProducts(
        variationProducts.filter(product => product._id !== deletedData._id)
      )
    }
  }, [isDeleteSuccess])

  if (isPatchPending || isCreatePending || isDeletePending)
    return <LoadingSpinner />

  return (
    <div>
      <div className={'my-2 mt-5 flex flex-col'}>
        <div className='pb-2 text-sm font-semibold'>Add variation category</div>
        <div className={'grid grid-cols-2 gap-10'}>
          <Input
            className='w-full'
            placeholder='Enter variation category name'
            value={categoryInput}
            onChange={e => setCategoryInput(e.target.value)}
          />
          <Button className={'w-36'} onClick={addVariationCategory}>
            Add Category
          </Button>
        </div>
      </div>

      {variationCategories.length > 0 && (
        <div>
          <div className='mt-4 pb-2 text-sm font-semibold'>
            Add variation category value
          </div>
          <div className={'flex gap-4'}>
            <Select
              value={selectedCategory}
              onValueChange={value => setSelectedCategory(value)}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                {variationCategories.map((category: any, index: number) => (
                  <SelectItem value={category} key={index}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={categoryValueInput}
              onChange={e => setCategoryValueInput(e.target.value)}
              className={'w-64'}
              placeholder={'Enter category value'}
            />
            <Button className={'w-36'} onClick={addVariationCategoryValue}>
              Add Value
            </Button>
          </div>
        </div>
      )}

      {variationCategories.map((category: any, index: number) => (
        <div key={index}>
          <div className={'mt-4 flex items-center gap-2 py-2'}>
            <div className={'text-sm font-semibold'}> {category}1</div>
            <TrashIcon
              className={'cursor-pointer text-red-500'}
              height={18}
              width={18}
              onClick={() => removeCategory(category)}
            />
          </div>
          <div className={'flex items-center p-2'}>
            {Object.values(variationCategoryValues[category] || []).map(
              (value: any, index: number) => (
                <div
                  key={index}
                  className={
                    'm-1 flex items-center justify-between whitespace-nowrap rounded-full border border-primary-dim py-2 pl-4 pr-2'
                  }
                >
                  {value}

                  <CrossCircledIcon
                    className={'cursor-pointer px-2 text-red-600'}
                    height={18}
                    width={'auto'}
                    onClick={() => removeCategoryValue(category, value)}
                  />
                </div>
              )
            )}
          </div>
        </div>
      ))}

      {variationDetails?._id && (
        <div className={'mt-5 flex justify-end'}>
          <Link
            href={`/products/variations/${variationDetails?._id}/new${page && limit ? `?page=${page}&limit=${limit}` : ''}`}
          >
            <Button size={'sm'} className='flex items-center gap-2'>
              <Plus />
              Add new product
            </Button>
          </Link>
        </div>
      )}

      <div className='mt-4 pb-8'>
        <ProductListTable
          products={variationProducts}
          variationId={variationDetails?._id}
          deleteProductById={deleteProductById}
          pagination={{ page, limit }}
        />
      </div>
    </div>
  )
}

const ProductListTable = ({
  products,
  variationId,
  deleteProductById,
  pagination
}: any) => {
  const { page, limit } = pagination
  const handleDelete = async (_id: string) => {
    deleteProductById(_id)
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TITLE</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>VARIATION</TableHead>
          <TableHead>PRICE</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products?.map((item: any) => (
          <TableRow key={item._id}>
            <TableCell>{item.title}</TableCell>
            <TableCell>{item.sku}</TableCell>
            <TableCell>
              <div className={'flex flex-col space-y-1'}>
                {Object.entries(item.variation).map((entry: any) => {
                  const [key, value] = entry
                  return (
                    <div key={key} className={'flex items-center space-x-2'}>
                      <span className={'rounded-md border px-1'}>{key}</span>
                      <span>{value}</span>
                    </div>
                  )
                })}
              </div>
            </TableCell>
            <TableCell className=''>${item.finalPrice.toFixed(2)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                  >
                    <DotsHorizontalIcon className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-[160px]'>
                  <Link
                    href={`/products/variations/${variationId}/${item?._id}${page && limit ? `?page=${page}&limit=${limit}` : ''}`}
                  >
                    <DropdownMenuItem className='cursor-pointer'>
                      Edit
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const Footer = ({ form, onSubmit, tab, data }: any) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = searchParams.get('page') ?? ''
  const limit = searchParams.get('limit') ?? ''

  const [open, setOpen] = useState(false)

  const clickFn = () => {
    console.log('submit form from footer -----')
    if (tab === 'variations') {
      onSubmit(data)
    } else form.handleSubmit(onSubmit)()
  }

  const onContinue = async () => {
    if (page && limit) router.push(`/products?page=${page}&limit=${limit}`)
    else router.back()
  }

  return (
    <div className={'flex h-full items-center justify-end gap-4 px-5'}>
      <AlertBox
        openState={[open, setOpen]}
        content={'Are you sure you want to go back?'}
        onContinue={onContinue}
      />
      <Button
        className={
          'w-24 border border-orange-500 bg-white text-center text-orange-500'
        }
        onClick={() => setOpen(true)}
      >
        Cancel
      </Button>
      <Button className={'w-24 text-center'} onClick={clickFn}>
        Save
      </Button>
    </div>
  )
}
