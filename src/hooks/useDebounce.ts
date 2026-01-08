import { useEffect, useState } from 'react'

export const useDebouncedValue = (inputValue: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(inputValue)
  const [isDebouncing, setDebouncingState] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue)
      setDebouncingState(false)
    }, delay)

    setDebouncingState(true)

    return () => {
      clearTimeout(handler)
    }
  }, [inputValue, delay])

  return { debouncedValue, isDebouncing }
}
