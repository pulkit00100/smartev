import type { RawRoute, TripProfile, RoutingPlan, ChargingStop, EnrichmentConfig } from '../types'
import { isValidTripProfile } from './tripProfile'

export const DEFAULT_JAGUAR_IPACE_CONFIG: EnrichmentConfig = {
  maxRangeKm: 350,
  minRangeKm: 200,
  maxChargeMins: 50,
  minChargeMins: 10,
  stopThresholdPercent: {
    conservative: 40,
    aggressive: 20,
  },
}

function effectiveRangeKm(tripProfile: TripProfile, config: EnrichmentConfig): number {
  const t = (tripProfile.speed - tripProfile.safety) / 100
  return config.minRangeKm + ((t + 1) / 2) * (config.maxRangeKm - config.minRangeKm)
}

function chargeDurationMinutes(tripProfile: TripProfile, config: EnrichmentConfig): number {
  const t = (tripProfile.safety - tripProfile.speed) / 100
  const mid = (config.maxChargeMins + config.minChargeMins) / 2
  const half = (config.maxChargeMins - config.minChargeMins) / 2
  return Math.round(mid + t * half)
}

function stopThreshold(tripProfile: TripProfile, config: EnrichmentConfig): number {
  if (tripProfile.safety > 50) return Infinity
  if (tripProfile.speed > 50) return config.stopThresholdPercent.aggressive
  return config.stopThresholdPercent.conservative
}

export function enrichRoute(
  rawRoute: RawRoute,
  tripProfile: TripProfile,
  config: EnrichmentConfig = DEFAULT_JAGUAR_IPACE_CONFIG
): RoutingPlan {
  if (!isValidTripProfile(tripProfile)) {
    throw new Error('Invalid TripProfile: reliability + safety + speed must equal 100')
  }

  const rangeKm = effectiveRangeKm(tripProfile, config)
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

  const threshold = stopThreshold(tripProfile, config)
  let simulatedRange = rangeKm
  const chargingStops: ChargingStop[] = []

  for (let i = 0; i < rawRoute.segments.length; i++) {
    simulatedRange -= rawRoute.segments[i].distanceKm
    const rangePercent = (simulatedRange / rangeKm) * 100

    const potentialStop = rawRoute.potentialChargingStops.find(
      (s) => s.location[0] === rawRoute.segments[i].polyline.coordinates[1][0]
    )

    if (potentialStop && (tripProfile.safety > 50 || rangePercent < threshold)) {
      chargingStops.push({
        location: potentialStop.location,
        chargerType: 'CCS',
        estimatedDurationMinutes: chargeDurationMinutes(tripProfile, config),
      })
      simulatedRange = rangeKm
    }
  }

  const totalDistanceKm = legs.reduce((acc, leg) => acc + leg.distanceKm, 0)
  const totalDurationMinutes =
    Math.round((totalDistanceKm / 100) * 60) +
    chargingStops.length * chargeDurationMinutes(tripProfile, config)

  return { legs, chargingStops, totalDistanceKm, totalDurationMinutes }
}
