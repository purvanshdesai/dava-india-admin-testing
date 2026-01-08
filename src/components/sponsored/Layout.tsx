'use client'
import React, { useEffect, useState } from 'react'
import AddSponsoredLayoutModal from './AddLayoutModal'
import Image from 'next/image'
import { useFetchSponsoredLayouts } from '@/utils/hooks/sponsoredHooks'
import { ChevronRight, GripVerticalIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { reorderSponsoredLayouts } from '@/utils/actions/sponsoredActions'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

export default function SponsoredMainLayout() {
  const router = useRouter()
  const [layouts, setLayouts] = useState<Array<any>>([])
  const { data: sponsoredData } = useFetchSponsoredLayouts({})

  useEffect(() => {
    setLayouts(sponsoredData?.data)
  }, [sponsoredData])

  const handleOnClickLayout = (layout: any) => {
    const { type } = layout

    if (type === 'image') {
      router.push(
        `/sponsored-layout/${layout?._id}/${layout?.banner?._id}?type=${type}`
      )
      return
    }

    router.push(`/sponsored-layout/${layout?._id}?type=${type}`)
  }

  const updateReOrderedLayout = async (layouts: Array<any>) => {
    await reorderSponsoredLayouts(layouts)
  }

  // a little function to help us with reordering the result
  const reorder = (list: any, startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  const onDragEnd = async (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const items = reorder(
      layouts,
      result.source.index,
      result.destination.index
    )

    setLayouts(items)

    await updateReOrderedLayout(
      items.map((i: any, idx) => {
        return { _id: i?._id, position: idx + 1 }
      })
    )
  }

  const hideLayout = (type: string) => {
    return layouts?.some(l => l.type === type)
  }

  return (
    <div className=''>
      <div
        className='grid grid-cols-[4fr_3fr] gap-4'
        style={{ height: 'calc(100vh - 40px)' }}
      >
        <div className='h-full rounded-md border'>
          <div className='flex items-center justify-between border-b p-3'>
            <p className='text-base font-semibold'>Sponsored Sections</p>
            {hasPermission(
              MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
              MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.CREATE_SPONSOR
            ) && (
              <AddSponsoredLayoutModal
                hideMembership={hideLayout('davaone-membership')}
                hideGenericInfo={hideLayout('generic-medicine-info')}
              />
            )}
          </div>

          <div
            className='overflow-y-auto'
            style={{ height: 'calc(100vh - 100px)' }}
          >
            {hasPermission(
              MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
              MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.READ_SPONSOR
            ) ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='droppable'>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`${snapshot.isDraggingOver ? 'bg-primary-light-blue' : 'bg-gray-300'} divide-y bg-white pt-3`}
                    >
                      {layouts?.map((layout: any, index: number) => {
                        return (
                          <Draggable
                            key={layout._id}
                            draggableId={layout._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${snapshot.isDragging ? 'select-none bg-primary text-white' : 'bg-white'} py-3`}
                              >
                                <div className='group flex cursor-pointer items-center px-3'>
                                  <div className='flex flex-1 items-center gap-2'>
                                    <GripVerticalIcon
                                      size={20}
                                      className={
                                        snapshot.isDragging
                                          ? 'text-white'
                                          : 'text-label'
                                      }
                                    />
                                    <p className='text-sm font-semibold group-hover:text-primary'>
                                      {layout.title}
                                    </p>
                                  </div>

                                  <div className='flex items-center gap-4'>
                                    <div
                                      className={`text-xs ${layout?.isActive ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                      {layout?.isActive ? 'Active' : 'InActive'}
                                    </div>

                                    {hasPermission(
                                      MODULES_PERMISSIONS.SPONSOR_MANAGEMENT
                                        .key,
                                      MODULES_PERMISSIONS.SPONSOR_MANAGEMENT
                                        .permissions.EDIT_SPONSOR
                                    ) && (
                                      <div
                                        onClick={() =>
                                          handleOnClickLayout(layout)
                                        }
                                      >
                                        <ChevronRight
                                          size={20}
                                          className='text-label'
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div>You don't have access to read the sponsored layouts!</div>
            )}
          </div>
        </div>
        <div className='flex h-full items-center justify-center rounded-md border bg-primary-light-blue'>
          {hasPermission(
            MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.key,
            MODULES_PERMISSIONS.SPONSOR_MANAGEMENT.permissions.CREATE_SPONSOR
          ) && (
            <div className='flex flex-col items-center justify-center space-y-4'>
              <div className='relative h-20 w-20'>
                <Image src={'/images/Drag.svg'} fill alt='Drag Image' />
              </div>

              <p className='text-center text-sm font-semibold'>
                Select Any Section to See the Info
              </p>
              <p className='text-center text-xs text-label'>
                Click and drag Icon to change position of the sections on the
                home screen
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
