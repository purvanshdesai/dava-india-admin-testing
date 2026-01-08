import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { ChangeEvent } from 'react'

interface SearchInputProps {
  placeholder: string
  onInputChange: (value: string) => void
}

export function SearchInput({ placeholder, onInputChange }: SearchInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value) // Pass the input value to parent
  }
  return (
    <>
      <div className='relative flex items-center gap-2'>
        <Search className='' />
        <div className='flex-1'>
          <Input
            type='text'
            placeholder={placeholder}
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  )
}
