import type { RawRoute, TripProfile, RoutingPlan, ChargingStop } from '../types'
import { isValidTripProfile } from './tripProfile'

// Assumed EV range in km — adjusted by Trip Profile speed/safety weight
function effectiveRangeKm(tripProfile: TripProfile): number {
  // Speed-heavy = optimistic range (350km), Safety-heavy = conservative range (200km)
  const base = 275
  const adjustment = ((tripProfile.speed - tripProfile.safety) / 100) * 75
  return base + adjustment
}

function chargeDurationMinutes(tripProfile: TripProfile): number {
  // Safety-heavy = longer charge (full top-up), Speed-heavy = quick charge
  const base = 30
  const adjustment = ((tripProfile.safety - tripProfile.speed) / 100) * 20
  return Math.round(base + adjustment)
}

export function enrichRoute(rawRoute: RawRoute, tripProfile: TripProfile): RoutingPlan {
  if (!isValidTripProfile(tripProfile)) {
    throw new Error('Invalid TripProfile: reliability + safety + speed must equal 100')
  }

  const rangeKm = effectiveRangeKm(tripProfile)
  let remainingRangeKm = rangeKm

  const legs = rawRoute.segments.map((segment) => {
    remainingRangeKm -= segment.distanceKm
    const estimatedRangeRemainingPercent = Math.max(0, Math.round((remainingRangeKm / rangeKm) * 100))
    return {
      distanceKm: segment.distanceKm,
      estimatedRangeRemainingPercent,
      polyline: segment.polyline,
    }
  })

  // Decide which potential charging stops to include based on Trip Profile
  const stopThreshold = tripProfile.safety > 50 ? Infinity : tripProfile.speed > 50 ? 20 : 40

  let simulatedRange = rangeKm
  const chargingStops: ChargingStop[] = []

  for (let i = 0; i < rawRoute.segments.length; i++) {
    simulatedRange -= rawRoute.segments[i].distanceKm
    const rangePercent = (simulatedRange / rangeKm) * 100

    const potentialStop = rawRoute.potentialChargingStops.find(
      (s) => s.location[0] === rawRoute.segments[i].polyline.coordinates[1][0]
    )

    if (potentialStop && (tripProfile.safety > 50 || rangePercent < stopThreshold)) {
      chargingStops.push({
        location: potentialStop.location,
        chargerType: 'CCS',
        estimatedDurationMinutes: chargeDurationMinutes(tripProfile),
      })
      simulatedRange = rangeKm
    }
  }

  const totalDistanceKm = legs.reduce((acc, leg) => acc + leg.distanceKm, 0)
  const totalDurationMinutes =
    Math.round((totalDistanceKm / 100) * 60) +
    chargingStops.length * chargeDurationMinutes(tripProfile)

  return { legs, chargingStops, totalDistanceKm, totalDurationMinutes }
}
