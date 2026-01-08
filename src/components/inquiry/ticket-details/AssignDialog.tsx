import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAddActivity, useFetchAssignee } from '@/utils/hooks/ticketHooks'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useQueryClient } from '@tanstack/react-query'

export default function AssignDialog({
  ticketId,
  dialogState
}: {
  ticketId: string
  dialogState: any[]
}) {
  const queryClient = useQueryClient()
  const { data, isPending } = useFetchAssignee(ticketId)
  // const { mutateAsync: setAssignee } = useSetAssignee()
  const { mutateAsync } = useAddActivity()
  const [, setIsOpen] = dialogState
  const [searchText, setSearchText] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')

  const setAssignee = async () => {
    await mutateAsync({
      ticketId,
      activity: 'assignee-changed',
      content: selectedUser
    })
    setIsOpen(false)
    queryClient.invalidateQueries({ queryKey: ['fetch-ticket-details'] })
  }

  useEffect(() => {
    setFilteredUsers(data)
  }, [data])

  useEffect(() => {
    if (data?.length) {
      if (searchText) {
        setFilteredUsers(
          data?.filter((u: any) =>
            new RegExp(`.*${searchText}.*`, 'i').test(u.name)
          )
        )
      } else {
        setFilteredUsers(data)
      }
    }
  }, [searchText])

  if (isPending) return <div>Loading ...</div>

  return (
    <DialogContent className='sm:max-w-1/2 p-0'>
      <DialogHeader className={'border-b'}>
        <DialogTitle className={'p-6'}>
          <div className={'flex justify-between'}>
            <div>Assign issue</div>
            <X
              className={'cursor-pointer'}
              size={18}
              onClick={() => setIsOpen(false)}
            />
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className={'flex h-full flex-col gap-2 px-6 py-3'}>
        <Input
          placeholder={'Search'}
          value={searchText}
          onInput={(e: any) => setSearchText(e.target.value)}
        />
        <RadioGroup
          defaultValue={data?.find((u: any) => u.assigned)?._id}
          onValueChange={(val: string) => setSelectedUser(val)}
        >
          <div className={'mt-3 flex flex-col gap-2'}>
            {filteredUsers?.map((u: any, idx: number) => (
              <div
                key={idx}
                className={
                  'flex items-center gap-4 rounded-md border bg-gray-100 p-2'
                }
              >
                <RadioGroupItem value={u._id} />
                <div>{u.name}</div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>
      <DialogFooter className={'p-3'}>
        <Button
          variant={'outline'}
          className={'w-48 rounded-lg text-primary'}
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
        <Button className={'w-48 rounded-lg'} onClick={() => setAssignee()}>
          Assign
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
