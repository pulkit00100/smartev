import { getRoute } from './dataSourceAdapter'

describe('getRoute', () => {
  it('returns a RawRoute with at least 3 segments', () => {
    const route = getRoute('London', 'Edinburgh')
    expect(route.segments.length).toBeGreaterThanOrEqual(3)
  })

  it('returns at least 2 potential charging stops', () => {
    const route = getRoute('London', 'Edinburgh')
    expect(route.potentialChargingStops.length).toBeGreaterThanOrEqual(2)
  })

  it('each segment has a polyline and distanceKm', () => {
    const route = getRoute('London', 'Edinburgh')
    for (const segment of route.segments) {
      expect(segment.polyline.type).toBe('LineString')
      expect(typeof segment.distanceKm).toBe('number')
      expect(segment.distanceKm).toBeGreaterThan(0)
    }
  })

  it('throws when origin and destination are identical', () => {
    expect(() => getRoute('London', 'London')).toThrow()
  })
})
