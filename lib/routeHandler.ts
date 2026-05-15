import type { RoutingPlan, TripProfile } from '../types'
import { isValidTripProfile } from './tripProfile'
import { getRoute } from './dataSourceAdapter'
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

export function handleRouteRequest(body: unknown): RouteResponse {
  const { origin, destination, tripProfile } = (body ?? {}) as RouteRequestBody

  if (!origin || !destination) {
    return { status: 400, data: { error: 'origin and destination are required' } }
  }

  if (!tripProfile || !isValidTripProfile(tripProfile)) {
    return { status: 400, data: { error: 'tripProfile must have reliability + safety + speed = 100' } }
  }

  try {
    const rawRoute = getRoute(origin, destination)
    const routingPlan = enrichRoute(rawRoute, tripProfile)
    return { status: 200, data: routingPlan }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return { status: 500, data: { error: message } }
  }
}
