/* eslint-disable react/jsx-no-undef */
import React, { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useFetchProducts } from '@/utils/hooks/productHooks'

const AddProductsModal = ({ AddProduct, alreadyExistProductIds = [] }: any) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5
  })
  const [products, setProducts] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const debounceTimeout = useRef<any>(null)
  const [selectedProducts, setSelectedProducts] = useState<any>([])

  const { data: productDetails, isSuccess } = useFetchProducts({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: [{ id: 'title', value: searchInput }]
  })

  const productsData = productDetails?.data
  const handleInputChange = (value: any) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      setSearchInput(value)
      setProducts([])
      setPagination({ pageIndex: 0, pageSize: 5 }) // Reset pagination
      setHasMore(true)
    }, 1000) // 300ms debounce delay
  }
  useEffect(() => {
    if (isSuccess && productsData?.length > 0) {
      setProducts((prevProducts): any => {
        const newProducts = productsData.filter(
          (product: any) =>
            !prevProducts.some(
              (prevProduct: any) => prevProduct._id === product._id
            )
        )
        return [...prevProducts, ...newProducts]
      })
      setIsFetching(false)
      if (products.length + productsData.length >= productDetails.total) {
        setHasMore(false)
      }
    } else if (isSuccess && productsData?.data?.length === 0) {
      setHasMore(false)
      setIsFetching(false)
    }
  }, [productsData, isSuccess])

  const handleLoadMore = () => {
    setIsFetching(true)
    setPagination(prev => ({
      ...prev,
      pageIndex: prev.pageIndex + 1
    }))
  }

  const handleCheckboxChange = (product: any) => {
    setSelectedProducts((prevSelected: any) => {
      if (prevSelected.includes(product)) {
        return prevSelected.filter((item: any) => item !== product)
      } else {
        return [...prevSelected, product]
      }
    })
  }

  return (
    <div>
      <Dialog open={openModal}>
        <DialogTrigger>
          <div
            className='w-52 rounded-md bg-primary px-3 py-1.5 text-white'
            onClick={() => setOpenModal(true)}
          >
            Add products
          </div>
        </DialogTrigger>
        <DialogContent className='p-0'>
          <div className='p-5'>
            <p className='mb-5 font-semibold'>Add Associated Products</p>
            <div>
              <Input
                placeholder='Search by Products Name'
                onChange={e => {
                  handleInputChange(e.target.value) // Pass the input value to debounce handler
                }}
              />
            </div>

            <div className='mb-5 mt-5'>
              <Separator />
            </div>
            <div className='h-[40vh] overflow-auto'>
              {products?.map((product: any) => (
                <div
                  key={product._id}
                  className='mb-2 flex w-full flex-row items-center justify-between rounded-md border bg-[#f9fbfd] pb-2 pl-3 pr-3 pt-2'
                >
                  <div className='flex flex-row items-center justify-center'>
                    <div className='mr-3'>
                      <Checkbox
                        className='border-black'
                        disabled={alreadyExistProductIds.includes(product._id)}
                        checked={
                          selectedProducts.includes(product) ||
                          alreadyExistProductIds.includes(product._id)
                        }
                        value={selectedProducts}
                        onCheckedChange={() => handleCheckboxChange(product)}
                      />
                    </div>
                    <div className='rounded-none border border-dashed'>
                      <Image
                        src={product?.thumbnail}
                        className='h-[61px] w-[61px]'
                        alt={''}
                        height={61}
                        width={61}
                      />
                    </div>
                    <div className='ml-3 flex flex-col items-start justify-between'>
                      <p className='text-sm font-semibold text-black'>
                        {product.title}
                      </p>
                      <p className='line-clamp-1 w-72 text-xs text-label'>
                        {product.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* {isFetching && <div>Loading more products...</div>} */}
              {hasMore ? (
                <Button onClick={handleLoadMore} disabled={isFetching}>
                  {isFetching ? 'Loading...' : 'Load More'}
                </Button>
              ) : (
                <div>No more products to load</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className='p-5'>
              <Button
                type='button'
                variant={'outline'}
                className='w-[197px]'
                onClick={() => {
                  setOpenModal(false), setSearchInput('')
                }}
              >
                <p>Cancel</p>
              </Button>
              <Button
                type='button'
                className='ml-5 w-[197px]'
                onClick={() => {
                  AddProduct(selectedProducts)
                  setSearchInput('') // Pass selected products
                  setOpenModal(false)
                  setSelectedProducts([])
                }}
              >
                <p>Add</p>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddProductsModal
