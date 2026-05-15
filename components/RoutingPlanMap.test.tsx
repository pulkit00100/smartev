import React from 'react'
import { render } from '@testing-library/react'
import { RoutingPlanMap } from './RoutingPlanMap'
import type { RoutingPlan } from '../types'

const mockRoutingPlan: RoutingPlan = {
  legs: [
    {
      distanceKm: 180,
      estimatedRangeRemainingPercent: 60,
      polyline: { type: 'LineString', coordinates: [[-0.1276, 51.5074], [-0.4965, 53.2307]] },
    },
  ],
  chargingStops: [
    { location: [-0.4965, 53.2307], chargerType: 'CCS', estimatedDurationMinutes: 30 },
  ],
  totalDistanceKm: 180,
  totalDurationMinutes: 138,
}

describe('RoutingPlanMap', () => {
  it('renders without error given a valid RoutingPlan', () => {
    expect(() => render(<RoutingPlanMap routingPlan={mockRoutingPlan} />)).not.toThrow()
  })

  it('renders without error when routingPlan is null', () => {
    expect(() => render(<RoutingPlanMap routingPlan={null} />)).not.toThrow()
  })
})
