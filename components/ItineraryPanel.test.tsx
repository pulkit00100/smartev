import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItineraryPanel } from './ItineraryPanel'
import type { RoutingPlan } from '../types'

const mockRoutingPlan: RoutingPlan = {
  legs: [
    { distanceKm: 180, estimatedRangeRemainingPercent: 60, polyline: { type: 'LineString', coordinates: [] } },
    { distanceKm: 120, estimatedRangeRemainingPercent: 20, polyline: { type: 'LineString', coordinates: [] } },
    { distanceKm: 230, estimatedRangeRemainingPercent: 45, polyline: { type: 'LineString', coordinates: [] } },
  ],
  chargingStops: [
    { location: [-0.49, 53.23], chargerType: 'CCS', estimatedDurationMinutes: 30 },
    { location: [-1.54, 53.80], chargerType: 'CCS', estimatedDurationMinutes: 25 },
  ],
  totalDistanceKm: 530,
  totalDurationMinutes: 378,
}

describe('ItineraryPanel', () => {
  it('renders empty state when routingPlan is null', () => {
    render(<ItineraryPanel routingPlan={null} open={true} onToggle={jest.fn()} />)
    expect(screen.getByText(/no route/i)).toBeInTheDocument()
  })

  it('renders correct number of legs', () => {
    render(<ItineraryPanel routingPlan={mockRoutingPlan} open={true} onToggle={jest.fn()} />)
    expect(screen.getAllByTestId('leg-item')).toHaveLength(3)
  })

  it('renders correct number of charging stops', () => {
    render(<ItineraryPanel routingPlan={mockRoutingPlan} open={true} onToggle={jest.fn()} />)
    expect(screen.getAllByTestId('stop-item')).toHaveLength(2)
  })

  it('displays leg distance and range values', () => {
    render(<ItineraryPanel routingPlan={mockRoutingPlan} open={true} onToggle={jest.fn()} />)
    expect(screen.getByText(/180 km/i)).toBeInTheDocument()
    expect(screen.getByText(/60%/i)).toBeInTheDocument()
  })

  it('displays charging stop charger type and duration', () => {
    render(<ItineraryPanel routingPlan={mockRoutingPlan} open={true} onToggle={jest.fn()} />)
    expect(screen.getAllByText(/CCS/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/30 min/i).length).toBeGreaterThan(0)
  })

  it('calls onToggle when handle is pressed', () => {
    const onToggle = jest.fn()
    render(<ItineraryPanel routingPlan={mockRoutingPlan} open={true} onToggle={onToggle} />)
    fireEvent.click(screen.getByTestId('toggle-handle'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
