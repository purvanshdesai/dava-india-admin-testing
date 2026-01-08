'use client'

import * as React from 'react'
import { MoonStar, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeSwitcher({ className }: { className?: string }) {
  const { setTheme } = useTheme()

  return (
    <>
      <Button variant={'ghost'} className={className}>
        <MoonStar
          className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
          onClick={() => setTheme('dark')}
        />
        <Sun
          className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
          onClick={() => setTheme('light')}
        />
        <span className='sr-only'>Toggle theme</span>
      </Button>
    </>
  )
}
