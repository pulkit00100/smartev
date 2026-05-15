'use client'

import { useState } from 'react'
import { RoutingPlanMap } from '../components/RoutingPlanMap'
import { ItineraryPanel } from '../components/ItineraryPanel'
import { TripProfileEditor } from '../components/TripProfileEditor'
import { useRoutingPlan } from '../lib/useRoutingPlan'
import { useTripProfile } from '../lib/TripProfileContext'

export default function Home() {
  const { activeProfile, setOverride, setDefault } = useTripProfile()
  const [panelOpen, setPanelOpen] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)

  const { routingPlan, loading } = useRoutingPlan('London', 'Edinburgh', activeProfile)

  return (
    <main style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      <RoutingPlanMap routingPlan={routingPlan} />

      {loading && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '6px 16px',
          borderRadius: 20, fontSize: 13, zIndex: 20,
        }}>
          Calculating route…
        </div>
      )}

      <button
        onClick={() => setShowProfileEditor((v) => !v)}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 20,
          background: '#fff', border: 'none', borderRadius: 12,
          padding: '8px 14px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer',
        }}
      >
        Trip Profile
      </button>

      {showProfileEditor && (
        <div style={{
          position: 'absolute', top: 56, right: 16, zIndex: 20,
          background: '#fff', borderRadius: 16, padding: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)', width: 300,
        }}>
          <TripProfileEditor profile={activeProfile} onChange={setOverride} />
          <button
            onClick={() => { setDefault(activeProfile); setShowProfileEditor(false) }}
            style={{
              width: '100%', marginTop: 8, padding: '10px 0',
              background: '#3B82F6', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Save as default
          </button>
        </div>
      )}

      <ItineraryPanel
        routingPlan={routingPlan}
        open={panelOpen}
        onToggle={() => setPanelOpen((v) => !v)}
      />
    </main>
  )
}
