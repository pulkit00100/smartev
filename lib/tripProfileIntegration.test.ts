import { handleRouteRequest } from './routeHandler'
import { createTripProfileStore } from './tripProfileStore'

describe('Trip Profile → Routing Plan integration', () => {
  it('activeProfile from store is sent to route request and shapes the RoutingPlan', () => {
    const store = createTripProfileStore()
    store.setOverride({ reliability: 10, safety: 80, speed: 10 })

    const result = handleRouteRequest({
      origin: 'London',
      destination: 'Edinburgh',
      tripProfile: store.activeProfile,
    })

    expect(result.status).toBe(200)
    if (result.status === 200) {
      expect(result.data.chargingStops.length).toBeGreaterThan(0)
    }
  })

  it('safety-heavy profile produces more charging stops than speed-heavy', () => {
    const safeResult = handleRouteRequest({
      origin: 'London',
      destination: 'Edinburgh',
      tripProfile: { reliability: 10, safety: 80, speed: 10 },
    })
    const speedResult = handleRouteRequest({
      origin: 'London',
      destination: 'Edinburgh',
      tripProfile: { reliability: 10, safety: 10, speed: 80 },
    })

    if (safeResult.status === 200 && speedResult.status === 200) {
      expect(safeResult.data.chargingStops.length).toBeGreaterThan(
        speedResult.data.chargingStops.length
      )
    }
  })

  it('changing override produces a different RoutingPlan', () => {
    const store = createTripProfileStore()

    store.setOverride({ reliability: 10, safety: 80, speed: 10 })
    const safePlan = handleRouteRequest({
      origin: 'London', destination: 'Edinburgh', tripProfile: store.activeProfile,
    })

    store.setOverride({ reliability: 10, safety: 10, speed: 80 })
    const speedPlan = handleRouteRequest({
      origin: 'London', destination: 'Edinburgh', tripProfile: store.activeProfile,
    })

    if (safePlan.status === 200 && speedPlan.status === 200) {
      expect(safePlan.data).not.toEqual(speedPlan.data)
    }
  })
})
