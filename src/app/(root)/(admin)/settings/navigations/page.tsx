'use client'
// import FormDialog from '@/components/form/FormDialogBox'
// import { DialogClose } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import { navigationSchema } from '@/lib/zod'
import { useGetAllCollections } from '@/utils/hooks/collectionsHooks'
import {
  useCreateNavigation,
  useFetchNavigation
} from '@/utils/hooks/navigationHooks'
import { deleteNavigation } from '@/utils/actions/navigationActions'
import { zodResolver } from '@hookform/resolvers/zod'
import { GripVertical } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import AlertBox from '@/components/AlertBox'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { reorderNavigationLayouts } from '@/utils/actions/navigationActions'
// import FormInputField from '@/components/form/FormInputField'
import FormComboboxField from '@/components/form/FormComboboxField'
import { hasPermission } from '@/lib/permissions'
import { MODULES_PERMISSIONS } from '@/utils/utils/constants'

const Menu = () => {
  const router = useRouter()
  // const addBtnRef = useRef(null) as any
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [isFormOpened, setFormOpened] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { mutateAsync: addNewNavigationMenu } = useCreateNavigation()
  const { data: collectionsData } = useGetAllCollections()
  const { data: navigations } = useFetchNavigation({ lastRefreshed })
  const [open, setOpen] = useState(false)
  const [layouts, setLayouts] = useState<Array<any>>([])
  const [menuToDelete, setMenuToDelete]: any = useState('')

  const [readPermission, setReadPermission] = useState<boolean>(false)
  const [createPermission, setCreatePermission] = useState<boolean>(false)
  const [editPermission, setEditPermission] = useState<boolean>(false)
  const [deletePermission, setDeletePermission] = useState<boolean>(false)

  const form = useForm<z.infer<typeof navigationSchema>>({
    resolver: zodResolver(navigationSchema),
    defaultValues: {
      collection: '',
      level: 1,
      parentMenu: null
    }
  })

  useEffect(() => {
    setLayouts(navigations)
  }, [navigations])

  const hasCreatePermission = hasPermission(
    MODULES_PERMISSIONS.NAVIGATION_MANAGEMENT.key,
    MODULES_PERMISSIONS.NAVIGATION_MANAGEMENT.permissions.CREATE_NAVIGATION
  )
  const hasEditPermission = hasPermission(
    MODULES_PERMISSIONS.NAVIGATION_MANAGEMENT.key,
    MODULES_PERMISSIONS.NAVIGATION_MANAGEMENT.permissions.EDIT_NAVIGATION
  )
  const hasDeletePermission = hasPermission(
    MODULES_PERMISSIONS.NAVIGATION_MANAGEMENT.key,
    MODULES_PERMISSIONS.NAVIGATION_MANAGEMENT.permissions.DELETE_NAVIGATION
  )
  const hasReadPermission = hasPermission(
    MODULES_PERMISSIONS.NAVIGATION_MANAGEMENT.key,
    MODULES_PERMISSIONS.NAVIGATION_MANAGEMENT.permissions.DELETE_NAVIGATION
  )

  useEffect(() => {
    setReadPermission(hasReadPermission)
    setEditPermission(hasEditPermission)
    setCreatePermission(hasCreatePermission)
    setDeletePermission(hasDeletePermission)
  }, [
    hasCreatePermission,
    hasEditPermission,
    hasDeletePermission,
    hasReadPermission
  ])

  const onSubmit = async (data: z.infer<typeof navigationSchema>) => {
    try {
      console.log(data)
      setLoading(true)
      await addNewNavigationMenu(data)
      setLastRefreshed(new Date())
      toast({
        title: 'Success',
        description: 'Created successfully'
      })
      setFormOpened(false)
    } catch (error) {
      console.error('Error creating navigation:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNewMenu = ({ level, parentMenu }: any) => {
    form.reset()
    // addBtnRef?.current?.click()
    form.setValue('level', level)
    if (parentMenu) form.setValue('parentMenu', parentMenu)

    setFormOpened(true)
  }

  const handleEdit = (collection: any) => {
    router.push(`/collections/${collection?.collection?._id}`)
  }

  const handleDelete = async () => {
    await deleteNavigation(menuToDelete?._id)
    setLastRefreshed(new Date())
    setMenuToDelete('')
  }

  const renderMenuRow = (menu: any) => {
    return (
      <div className='group flex w-full items-center justify-between p-2 pr-6'>
        <div className='flex items-center gap-3'>
          <GripVertical size={20} />

          <span className='text-sm font-medium'>{menu?.collection?.name}</span>
        </div>
        <div className='invisible flex space-x-4 group-hover:visible'>
          {editPermission && (
            <div
              onClick={() => {
                handleEdit(menu)
              }}
              className='text-sm text-label'
            >
              Edit
            </div>
          )}

          {deletePermission && (
            <div
              onClick={() => {
                setOpen(true)
                setMenuToDelete(menu)
              }}
              className='text-sm text-red-600'
            >
              Delete
            </div>
          )}

          <AlertBox
            openState={[open, setOpen]}
            content={'Are you sure you want to delete ?'}
            onContinue={() => handleDelete()}
          />
        </div>
      </div>
    )
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

    await reorderNavigationLayouts(
      items.map((i: any, idx) => {
        return { _id: i?._id, position: idx + 1 }
      })
    )
  }

  // Recursive rendering of menu
  const renderMenu = (menu: any, index: number) => {
    const level1Items = menu?.items ?? []

    return (
      <AccordionItem value={menu?._id} key={index} className='py-0'>
        <AccordionTrigger className='py-1'>
          {renderMenuRow(menu)}
        </AccordionTrigger>
        <AccordionContent>
          {level1Items &&
            level1Items.map((item: any, l1Idx: number) => {
              const level2Items = item?.items ?? []

              return (
                <Accordion
                  type='single'
                  collapsible
                  key={l1Idx}
                  className='pl-6'
                >
                  <AccordionItem value={item?._id} className='py-0'>
                    <AccordionTrigger className='py-1'>
                      {renderMenuRow(item)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div>
                        <div className='pl-8'>
                          {level2Items &&
                            level2Items.map((level3: any, l2Idx: number) => {
                              return (
                                <div key={l2Idx} className='py-1'>
                                  {renderMenuRow(level3)}
                                </div>
                              )
                            })}
                        </div>
                      </div>

                      {createPermission && (
                        <div
                          className='cursor-pointer pl-12 pt-2 text-sm text-label hover:underline'
                          onClick={() =>
                            addNewMenu({ level: 3, parentMenu: item._id })
                          }
                        >
                          + Add new menu
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )
            })}

          {createPermission && (
            <div
              className='cursor-pointer pl-12 pt-6 text-xs text-label hover:underline'
              onClick={() => addNewMenu({ level: 2, parentMenu: menu._id })}
            >
              + Add Sub menu
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-4'>
      <div className='w-full rounded border bg-white p-4'>
        <h1 className='mb-4 text-xl font-semibold'>Category Navigation</h1>

        {readPermission ? (
          <div>
            <Accordion type='single' collapsible>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='droppable'>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`${snapshot.isDraggingOver ? 'bg-primary-light-blue' : 'bg-gray-300'} bg-white`}
                    >
                      {(layouts ?? [])?.map((layout: any, index: number) => {
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
                                className={`${snapshot.isDragging ? 'select-none bg-primary text-white' : 'bg-white'}`}
                              >
                                {renderMenu(layout, index)}
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
            </Accordion>
          </div>
        ) : (
          <div>You don't have access to read navigations!</div>
        )}

        {createPermission && (
          <div
            className='mt-6 cursor-pointer pl-6 text-xs text-label hover:underline'
            onClick={() => addNewMenu({ level: 1 })}
          >
            + Add Main menu
          </div>
        )}
      </div>

      {isFormOpened && (
        <div className='w-full rounded border bg-white p-4'>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='flex flex-col gap-4'>
                  <FormComboboxField
                    isSmall={true}
                    formInstance={form as unknown as UseFormReturn}
                    multiple={false}
                    label={'Collections'}
                    name={'collection'}
                    items={(collectionsData as any)?.map((c: any) => ({
                      label: c.name,
                      value: c._id
                    }))}
                    className={'z-[200] w-full'}
                  />

                  <div className='flex items-center justify-end gap-3'>
                    <div onClick={() => setFormOpened(false)}>Cancel</div>
                    <Button
                      loader={loading}
                      // onClick={() => onSubmit(form.getValues())}
                      type='submit'
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu
