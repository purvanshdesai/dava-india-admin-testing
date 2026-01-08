'use client'
import { createContext, useState, useContext, ReactNode } from 'react'

interface FooterContextType {
  footerContent: ReactNode | null // footerContent is a React element or null
  setFooterContent: (content: ReactNode | null) => void // A function to set the footer content
}

const FooterContext = createContext<FooterContextType | undefined>(undefined)

interface FooterProviderProps {
  children: ReactNode // Children are React elements
}

export const FooterProvider = ({ children }: FooterProviderProps) => {
  const [footerContent, setFooterContent] = useState<ReactNode | null>(null)

  return (
    <FooterContext.Provider
      value={{
        footerContent,
        setFooterContent: (content: ReactNode | null) =>
          setFooterContent(
            content ? <div style={{ height: '55px' }}>{content}</div> : null
          )
      }}
    >
      {children}
    </FooterContext.Provider>
  )
}

export const useFooter = (): FooterContextType => {
  const context = useContext(FooterContext)
  if (context === undefined) {
    throw new Error('useFooter must be used within a FooterProvider')
  }
  return context
}
