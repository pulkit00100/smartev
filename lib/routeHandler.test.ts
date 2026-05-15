import { handleRouteRequest } from './routeHandler'
import type { DataSource, RawRoute } from '../types'

const validBody = {
  origin: 'London',
  destination: 'Edinburgh',
  tripProfile: { reliability: 34, safety: 33, speed: 33 },
}

const mockRoute: RawRoute = {
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

const testDataSource: DataSource = {
  getRoute: (origin, destination) => {
    if (origin === destination) return Promise.reject(new Error('Same origin and destination'))
    return Promise.resolve(mockRoute)
  },
}

describe('handleRouteRequest', () => {
  it('valid request returns 200 with a RoutingPlan', async () => {
    const result = await handleRouteRequest(validBody, testDataSource)
    expect(result.status).toBe(200)
    expect('legs' in result.data).toBe(true)
    expect('chargingStops' in result.data).toBe(true)
  })

  it('missing origin returns 400', async () => {
    const result = await handleRouteRequest({ ...validBody, origin: undefined }, testDataSource)
    expect(result.status).toBe(400)
  })

  it('missing destination returns 400', async () => {
    const result = await handleRouteRequest({ ...validBody, destination: undefined }, testDataSource)
    expect(result.status).toBe(400)
  })

  it('invalid tripProfile (does not sum to 100) returns 400', async () => {
    const result = await handleRouteRequest(
      { ...validBody, tripProfile: { reliability: 50, safety: 50, speed: 50 } },
      testDataSource
    )
    expect(result.status).toBe(400)
  })

  it('origin === destination returns 500', async () => {
    const result = await handleRouteRequest(
      { ...validBody, origin: 'London', destination: 'London' },
      testDataSource
    )
    expect(result.status).toBe(500)
  })

  it('accepts an injected DataSource — custom source is called', async () => {
    const customSource: DataSource = { getRoute: jest.fn().mockResolvedValue(mockRoute) }
    await handleRouteRequest(validBody, customSource)
    expect(customSource.getRoute).toHaveBeenCalledWith('London', 'Edinburgh')
  })
})
