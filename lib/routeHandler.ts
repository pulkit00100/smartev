import type { RoutingPlan, TripProfile, DataSource } from '../types'
import { isValidTripProfile } from './tripProfile'
import { mockDataSource } from './dataSourceAdapter'
import { enrichRoute } from './routeEnrichmentService'

type RouteRequestBody = {
  origin?: string
  destination?: string
  tripProfile?: TripProfile
}

type RouteResponse =
  | { status: 200; data: RoutingPlan }
  | { status: 400; data: { error: string } }
  | { status: 500; data: { error: string } }

export async function handleRouteRequest(
  body: unknown,
  dataSource: DataSource = mockDataSource
): Promise<RouteResponse> {
  const { origin, destination, tripProfile } = (body ?? {}) as RouteRequestBody

  if (!origin || !destination) {
    return { status: 400, data: { error: 'origin and destination are required' } }
  }

  if (!tripProfile || !isValidTripProfile(tripProfile)) {
    return { status: 400, data: { error: 'tripProfile must have reliability + safety + speed = 100' } }
  }

  try {
    const rawRoute = await dataSource.getRoute(origin, destination)
    const routingPlan = enrichRoute(rawRoute, tripProfile)
    return { status: 200, data: routingPlan }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return { status: 500, data: { error: message } }
  }
}
