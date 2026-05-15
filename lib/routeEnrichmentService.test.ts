import { enrichRoute } from './routeEnrichmentService'
import type { RawRoute, TripProfile } from '../types'

const mockRawRoute: RawRoute = {
  segments: [
    {
      polyline: { type: 'LineString', coordinates: [[-0.1276, 51.5074], [-0.4965, 53.2307]] },
      distanceKm: 180,
    },
    {
      polyline: { type: 'LineString', coordinates: [[-0.4965, 53.2307], [-1.5491, 53.8008]] },
      distanceKm: 120,
    },
    {
      polyline: { type: 'LineString', coordinates: [[-1.5491, 53.8008], [-3.1883, 55.9533]] },
      distanceKm: 230,
    },
  ],
  potentialChargingStops: [
    { location: [-0.4965, 53.2307] },
    { location: [-1.5491, 53.8008] },
  ],
}

const balanced: TripProfile = { reliability: 34, safety: 33, speed: 33 }
const safetyHeavy: TripProfile = { reliability: 10, safety: 80, speed: 10 }
const speedHeavy: TripProfile = { reliability: 10, safety: 10, speed: 80 }

describe('enrichRoute', () => {
  it('returns a RoutingPlan with correct shape for balanced profile', () => {
    const plan = enrichRoute(mockRawRoute, balanced)
    expect(plan.legs).toHaveLength(3)
    expect(plan.chargingStops).toBeDefined()
    expect(typeof plan.totalDistanceKm).toBe('number')
    expect(typeof plan.totalDurationMinutes).toBe('number')
  })

  it('each leg has distanceKm, estimatedRangeRemainingPercent, and polyline', () => {
    const plan = enrichRoute(mockRawRoute, balanced)
    for (const leg of plan.legs) {
      expect(typeof leg.distanceKm).toBe('number')
      expect(typeof leg.estimatedRangeRemainingPercent).toBe('number')
      expect(leg.polyline.type).toBe('LineString')
    }
  })

  it('totalDistanceKm equals sum of all leg distances', () => {
    const plan = enrichRoute(mockRawRoute, balanced)
    const sum = plan.legs.reduce((acc, leg) => acc + leg.distanceKm, 0)
    expect(plan.totalDistanceKm).toBe(sum)
  })

  it('throws when TripProfile does not sum to 100', () => {
    const invalid: TripProfile = { reliability: 50, safety: 50, speed: 50 }
    expect(() => enrichRoute(mockRawRoute, invalid)).toThrow()
  })

  it('safety-heavy profile produces more charging stops than speed-heavy', () => {
    const safePlan = enrichRoute(mockRawRoute, safetyHeavy)
    const speedPlan = enrichRoute(mockRawRoute, speedHeavy)
    expect(safePlan.chargingStops.length).toBeGreaterThan(speedPlan.chargingStops.length)
  })

  it('is a pure function — same inputs produce identical output', () => {
    const plan1 = enrichRoute(mockRawRoute, balanced)
    const plan2 = enrichRoute(mockRawRoute, balanced)
    expect(plan1).toEqual(plan2)
  })

  it('each charging stop has location, chargerType, and estimatedDurationMinutes', () => {
    const plan = enrichRoute(mockRawRoute, safetyHeavy)
    for (const stop of plan.chargingStops) {
      expect(stop.location).toHaveLength(2)
      expect(typeof stop.chargerType).toBe('string')
      expect(typeof stop.estimatedDurationMinutes).toBe('number')
      expect(stop.estimatedDurationMinutes).toBeGreaterThan(0)
    }
  })
})
