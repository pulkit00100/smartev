'use client'

import { useState, useEffect } from 'react'
import type { RoutingPlan, TripProfile } from '../types'

type UseRoutingPlanResult = {
  routingPlan: RoutingPlan | null
  loading: boolean
  error: string | null
}

export function useRoutingPlan(
  origin: string,
  destination: string,
  tripProfile: TripProfile
): UseRoutingPlanResult {
  const [routingPlan, setRoutingPlan] = useState<RoutingPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, tripProfile }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRoutingPlan(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [origin, destination, tripProfile])

  return { routingPlan, loading, error }
}
