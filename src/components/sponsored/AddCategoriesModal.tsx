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
import { useFetchCollections } from '@/utils/hooks/collectionsHooks'

const AddCategoriesModal = ({
  AddCategory,
  alreadyExistCategoryIds = []
}: any) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5
  })
  const [categories, setCategories] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const debounceTimeout = useRef<any>(null)
  const [selectedCategories, setSelectedCategories] = useState<any>([])

  const { data: categoriesDetails, isSuccess } = useFetchCollections({
    $limit: pagination.pageSize,
    $skip: pagination.pageIndex * pagination.pageSize,
    filters: [
      { id: 'name', value: searchInput },
      { id: 'type', value: 'subCategory' }
    ]
  }) as any

  const categoriesData = categoriesDetails?.data
  const handleInputChange = (value: any) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      setSearchInput(value)
      setCategories([])
      setPagination({ pageIndex: 0, pageSize: 5 }) // Reset pagination
      setHasMore(true)
    }, 1000) // 300ms debounce delay
  }
  useEffect(() => {
    if (isSuccess && categoriesData?.length > 0) {
      setCategories((prevProducts): any => {
        const newProducts = categoriesData.filter(
          (product: any) =>
            !prevProducts.some(
              (prevProduct: any) => prevProduct._id === product._id
            )
        )
        return [...prevProducts, ...newProducts]
      })
      setIsFetching(false)
      if (
        categories.length + categoriesData.length >=
        categoriesDetails.total
      ) {
        setHasMore(false)
      }
    } else if (isSuccess && categoriesData?.data?.length === 0) {
      setHasMore(false)
      setIsFetching(false)
    }
  }, [categoriesData, isSuccess])

  const handleLoadMore = () => {
    setIsFetching(true)
    setPagination(prev => ({
      ...prev,
      pageIndex: prev.pageIndex + 1
    }))
  }

  const handleCheckboxChange = (product: any) => {
    console.log('categories', product)

    setSelectedCategories((prevSelected: any) => {
      if (prevSelected.includes(product)) {
        return prevSelected.filter((item: any) => item !== product)
      } else {
        return [...prevSelected, product]
      }
    })
  }
  function truncateString(str:any, maxLength = 50) {
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + '...'
    }
    return str
  }
  return (
    <div>
      <Dialog open={openModal}>
        <DialogTrigger>
          <div
            className='w-52 rounded-md bg-primary px-3 py-1.5 text-white'
            onClick={() => setOpenModal(true)}
          >
            Add Collections
          </div>
        </DialogTrigger>
        <DialogContent className='p-0'>
          <div className='p-5'>
            <p className='mb-5 font-semibold'>Add Collections</p>
            <div>
              <Input
                placeholder='Search by collection Name'
                onChange={e => {
                  handleInputChange(e.target.value) // Pass the input value to debounce handler
                }}
              />
            </div>

            <div className='mb-5 mt-5'>
              <Separator />
            </div>
            <div className='h-[40vh] overflow-auto'>
              {categories?.map((product: any) => (
                <div
                  key={product._id}
                  className='mb-2 flex w-full flex-row items-center justify-between rounded-md border bg-[#f9fbfd] pb-2 pl-3 pr-3 pt-2'
                >
                  <div className='flex flex-row items-center justify-center'>
                    <div className='mr-3 flex-shrink-0'>
                      <Checkbox
                        className='border-black'
                        disabled={alreadyExistCategoryIds?.includes(
                          product._id
                        )}
                        checked={
                          selectedCategories?.includes(product) ||
                          alreadyExistCategoryIds?.includes(product._id)
                        }
                        value={selectedCategories}
                        onCheckedChange={() => handleCheckboxChange(product)}
                      />
                    </div>
                    <div className='rounded-none flex-shrink-0'>
                      <Image
                        src={product?.image}
                        className='h-[61px] w-[61px]'
                        alt={''}
                        height={61}
                        width={61}
                      />
                    </div>
                    <div className='ml-3 flex flex-1 flex-col items-start justify-between'>
                      <p className='text-sm font-semibold text-black'>
                        {product.name}
                      </p>
                      <p className='line-clamp-1 text-xs text-label'>
                        {truncateString(product.description)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* {isFetching && <div>Loading more categories...</div>} */}
              {hasMore ? (
                <Button onClick={handleLoadMore} disabled={isFetching}>
                  {isFetching ? 'Loading...' : 'Load More'}
                </Button>
              ) : (
                <div>No more categories to load</div>
              )}
              {/* {!hasMore && <div>No more categories to load</div>} */}
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
                  AddCategory(selectedCategories)
                  setSearchInput('') // Pass selected categories
                  setOpenModal(false)
                  setSelectedCategories([])
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

export default AddCategoriesModal
