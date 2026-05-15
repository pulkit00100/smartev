import type { TripProfile } from '../types'

/**
 * Sets the dominant axis to the given value and redistributes the remainder
 * equally across the other two axes. All three axes always sum to 100.
 */
export function redistributeProfile(
  dominant: keyof TripProfile,
  value: number,
): TripProfile {
  const clamped = Math.max(0, Math.min(100, value))
  const remainder = 100 - clamped
  const each = remainder / 2

  const axes: Array<keyof TripProfile> = ['reliability', 'safety', 'speed']
  const others = axes.filter((a) => a !== dominant)

  return {
    [dominant]: clamped,
    [others[0]]: each,
    [others[1]]: each,
  } as TripProfile
}
