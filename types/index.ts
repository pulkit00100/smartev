import type { LineString } from 'geojson'

export type TripProfile = {
  reliability: number
  safety: number
  speed: number
}

export type ChargingStop = {
  location: [number, number]
  chargerType: string
  estimatedDurationMinutes: number
}

export type RoutingPlanLeg = {
  distanceKm: number
  estimatedRangeRemainingPercent: number
  polyline: LineString
}

export type RawRouteSegment = {
  polyline: LineString
  distanceKm: number
}

export type RawRoute = {
  segments: RawRouteSegment[]
  potentialChargingStops: Array<{ location: [number, number] }>
}

export type RoutingPlan = {
  legs: RoutingPlanLeg[]
  chargingStops: ChargingStop[]
  totalDistanceKm: number
  totalDurationMinutes: number
}
