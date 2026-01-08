'use client'

import { useDeleteTax } from '@/utils/hooks/taxesHooks'
import AddNewTax from './AddNewTax'
import AddTaxGroupName from './AddTaxGroupName'
import { useToast } from '@/hooks/use-toast'
import AlertBox from '../AlertBox'
import { useState } from 'react'

export function TableRowActions({ row }: any) {
  const task = row.original
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const deleteTaxById = useDeleteTax()
  const onContinue = async () => {
    deleteTaxById.mutateAsync({ taxId: task._id })
    toast({
      title: 'Success',
      description: 'Deleted successfully'
    })
  }
  return (
    <div className='flex'>
      <AlertBox
        openState={[open, setOpen]}
        content={'Are you sure you want to delete this Tax?'}
        onContinue={onContinue}
      />
      {task?.category === 'single' ? (
        <div className='flex flex-row items-center justify-end'>
          <AddNewTax label={'Edit'} id={task._id} />
          <div
            className='ml-5 cursor-pointer'
            onClick={() => {
              setOpen(true)
            }}
          >
            Delete
          </div>
        </div>
      ) : (
        <div className='flex flex-row items-center justify-end'>
          <AddTaxGroupName label={'Edit'} id={task._id} />
          <div
            className='ml-5 cursor-pointer'
            onClick={() => {
              deleteTaxById.mutateAsync({ taxId: task._id })
              toast({
                title: 'Success',
                description: 'Deleted successfully'
              })
            }}
          >
            Delete
          </div>
        </div>
      )}
    </div>
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button
    //       variant='ghost'
    //       className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
    //     >
    //       <DotsHorizontalIcon className='h-4 w-4' />
    //       <span className='sr-only'>Open menu</span>
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align='end' className='w-[160px]'>
    //     <DropdownMenuItem>
    //       <AddNewTax label={'Edit'} id={task._id} />
    //     </DropdownMenuItem>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem onClick={handleDelete}>
    //       Delete
    //       <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  )
}
