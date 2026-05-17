'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TourContextValue {
  isTourActive: boolean
  setIsTourActive: (active: boolean) => void
}

const TourContext = createContext<TourContextValue>({
  isTourActive: false,
  setIsTourActive: () => {},
})

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false)

  return (
    <TourContext.Provider value={{ isTourActive, setIsTourActive }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTourContext() {
  return useContext(TourContext)
}
