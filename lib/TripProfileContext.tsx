'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { createTripProfileStore } from './tripProfileStore'
import type { TripProfile } from '../types'

type TripProfileContextValue = {
  activeProfile: TripProfile
  defaultProfile: TripProfile
  setOverride: (profile: TripProfile) => void
  setDefault: (profile: TripProfile) => void
  resetOverride: () => void
}

const TripProfileContext = createContext<TripProfileContextValue | null>(null)

const store = createTripProfileStore()

export function TripProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<TripProfile>(store.activeProfile)
  const [defaultProfile, setDefaultProfile] = useState<TripProfile>(store.defaultProfile)

  const setOverride = useCallback((profile: TripProfile) => {
    store.setOverride(profile)
    setActiveProfile(profile)
  }, [])

  const setDefault = useCallback((profile: TripProfile) => {
    store.setDefault(profile)
    setDefaultProfile(profile)
    setActiveProfile(store.activeProfile)
  }, [])

  const resetOverride = useCallback(() => {
    store.resetOverride()
    setActiveProfile(store.activeProfile)
  }, [])

  return (
    <TripProfileContext.Provider
      value={{ activeProfile, defaultProfile, setOverride, setDefault, resetOverride }}
    >
      {children}
    </TripProfileContext.Provider>
  )
}

export function useTripProfile(): TripProfileContextValue {
  const ctx = useContext(TripProfileContext)
  if (!ctx) throw new Error('useTripProfile must be used within TripProfileProvider')
  return ctx
}
