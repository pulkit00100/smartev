import type { TripProfile } from '../types'

export function isValidTripProfile(profile: TripProfile): boolean {
  const { reliability, safety, speed } = profile
  if (reliability < 0 || safety < 0 || speed < 0) return false
  return reliability + safety + speed === 100
}
