'use client'

import type { RoutingPlan } from '../types'

interface ItineraryPanelProps {
  routingPlan: RoutingPlan | null
  open: boolean
  onToggle: () => void
}

export function ItineraryPanel({ routingPlan, open, onToggle }: ItineraryPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        transform: open ? 'translateY(0)' : 'translateY(calc(100% - 56px))',
        transition: 'transform 0.3s ease',
        maxHeight: '70dvh',
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      {/* Drag handle / toggle */}
      <div
        data-testid="toggle-handle"
        onClick={onToggle}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 56,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D1D5DB' }} />
      </div>

      <div style={{ padding: '0 16px 24px' }}>
        {!routingPlan ? (
          <p style={{ color: '#6B7280', textAlign: 'center' }}>No route planned yet.</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
              {routingPlan.totalDistanceKm} km · {routingPlan.totalDurationMinutes} min total
            </p>

            {routingPlan.legs.map((leg, i) => (
              <div key={i}>
                <div
                  data-testid="leg-item"
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Leg {i + 1}</span>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>
                    {leg.distanceKm} km · {leg.estimatedRangeRemainingPercent}% remaining
                  </span>
                </div>

                {routingPlan.chargingStops[i] && (
                  <div
                    data-testid="stop-item"
                    style={{
                      padding: '10px 12px',
                      margin: '8px 0',
                      background: '#F0FDF4',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#166534' }}>
                      ⚡ {routingPlan.chargingStops[i].chargerType}
                    </span>
                    <span style={{ fontSize: 13, color: '#166534' }}>
                      {routingPlan.chargingStops[i].estimatedDurationMinutes} min
                    </span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default ItineraryPanel
