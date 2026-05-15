import { handleRouteRequest } from './routeHandler'
import type { TripProfile } from '../types'

// Test the handler directly — the hook is just a thin wrapper around it
const balanced: TripProfile = { reliability: 34, safety: 33, speed: 33 }

describe('useRoutingPlan (via handleRouteRequest)', () => {
  it('fetching with valid origin/destination returns a RoutingPlan with legs', () => {
    const result = handleRouteRequest({
      origin: 'London',
      destination: 'Edinburgh',
      tripProfile: balanced,
    })
    expect(result.status).toBe(200)
    if (result.status === 200) {
      expect(result.data.legs.length).toBeGreaterThan(0)
      expect(result.data.chargingStops).toBeDefined()
    }
  })

  it('charging stops in the RoutingPlan have valid coordinates', () => {
    const result = handleRouteRequest({
      origin: 'London',
      destination: 'Edinburgh',
      tripProfile: { reliability: 10, safety: 80, speed: 10 },
    })
    if (result.status === 200) {
      for (const stop of result.data.chargingStops) {
        expect(stop.location).toHaveLength(2)
        expect(typeof stop.location[0]).toBe('number')
        expect(typeof stop.location[1]).toBe('number')
      }
    }
  })
})
