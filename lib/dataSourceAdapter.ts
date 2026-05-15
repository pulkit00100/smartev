import type { RawRoute } from '../types'

export function getRoute(origin: string, destination: string): RawRoute {
  if (origin === destination) {
    throw new Error('Origin and destination must be different')
  }

  // Mock: London → Edinburgh via real A1/M1 corridor
  return {
    segments: [
      {
        polyline: {
          type: 'LineString',
          coordinates: [
            [-0.1276, 51.5074], // London
            [-0.4965, 53.2307], // Grantham area
          ],
        },
        distanceKm: 180,
      },
      {
        polyline: {
          type: 'LineString',
          coordinates: [
            [-0.4965, 53.2307], // Grantham area
            [-1.5491, 53.8008], // Leeds area
          ],
        },
        distanceKm: 120,
      },
      {
        polyline: {
          type: 'LineString',
          coordinates: [
            [-1.5491, 53.8008], // Leeds area
            [-3.1883, 55.9533], // Edinburgh
          ],
        },
        distanceKm: 230,
      },
    ],
    potentialChargingStops: [
      { location: [-0.4965, 53.2307] }, // Grantham services
      { location: [-1.5491, 53.8008] }, // Leeds services
    ],
  }
}
