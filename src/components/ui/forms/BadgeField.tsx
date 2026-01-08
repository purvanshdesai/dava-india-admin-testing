'use client'
import React, { useState } from 'react'
import { Input } from '../input'
import { Button } from '../button'
import { Badge } from '../badge'
import { FieldValues } from 'react-hook-form'

type TProps = {
  field: FieldValues
}
const BadgeField = ({ field }: TProps) => {
  const [input, setInput] = useState<string>('')

  const add = () => {
    if (input) {
      field.onChange([...field.value, input])
      setInput('')
    }
  }
  return (
    <div className='w-full rounded-lg border border-gray-300 p-2'>
      <div className='flex gap-2'>
        {field?.value?.map((badge: string, index: number) => (
          <Badge key={index}>{badge}</Badge>
        ))}
      </div>
      <div className='mt-4 flex w-full flex-row gap-2'>
        <Input
          value={input}
          onChange={event => setInput(event.target.value)}
          className='block w-full'
          placeholder='Enter clkmds'
        />
        <Button type='button' onClick={add}>
          Add
        </Button>
      </div>
    </div>
  )
}

export default BadgeField
