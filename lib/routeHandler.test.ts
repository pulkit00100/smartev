import { handleRouteRequest } from './routeHandler'

const validBody = {
  origin: 'London',
  destination: 'Edinburgh',
  tripProfile: { reliability: 34, safety: 33, speed: 33 },
}

describe('handleRouteRequest', () => {
  it('valid request returns 200 with a RoutingPlan', () => {
    const result = handleRouteRequest(validBody)
    expect(result.status).toBe(200)
    expect('legs' in result.data).toBe(true)
    expect('chargingStops' in result.data).toBe(true)
  })

  it('missing origin returns 400', () => {
    const result = handleRouteRequest({ ...validBody, origin: undefined })
    expect(result.status).toBe(400)
  })

  it('missing destination returns 400', () => {
    const result = handleRouteRequest({ ...validBody, destination: undefined })
    expect(result.status).toBe(400)
  })

  it('invalid tripProfile (does not sum to 100) returns 400', () => {
    const result = handleRouteRequest({
      ...validBody,
      tripProfile: { reliability: 50, safety: 50, speed: 50 },
    })
    expect(result.status).toBe(400)
  })

  it('origin === destination returns 500', () => {
    const result = handleRouteRequest({ ...validBody, origin: 'London', destination: 'London' })
    expect(result.status).toBe(500)
  })
})
