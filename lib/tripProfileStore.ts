import type { TripProfile } from '../types'

const BALANCED: TripProfile = { reliability: 34, safety: 33, speed: 33 }
const STORAGE_KEY = 'smartev:defaultTripProfile'

function loadDefault(): TripProfile {
  if (typeof window === 'undefined') return BALANCED
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : BALANCED
  } catch {
    return BALANCED
  }
}

function saveDefault(profile: TripProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export type TripProfileStore = {
  defaultProfile: TripProfile
  activeProfile: TripProfile
  setDefault: (profile: TripProfile) => void
  setOverride: (profile: TripProfile) => void
  resetOverride: () => void
}

export function createTripProfileStore(): TripProfileStore {
  let defaultProfile: TripProfile = loadDefault()
  let override: TripProfile | null = null

  return {
    get defaultProfile() {
      return defaultProfile
    },
    get activeProfile() {
      return override ?? defaultProfile
    },
    setDefault(profile: TripProfile) {
      defaultProfile = profile
      saveDefault(profile)
    },
    setOverride(profile: TripProfile) {
      override = profile
    },
    resetOverride() {
      override = null
    },
  }
}
