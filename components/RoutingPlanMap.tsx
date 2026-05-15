'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { RoutingPlan } from '../types'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

interface RoutingPlanMapProps {
  routingPlan: RoutingPlan | null
}

export function RoutingPlanMap({ routingPlan }: RoutingPlanMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-0.1276, 51.5074],
      zoom: 6,
    })

    mapRef.current = map

    map.once('load', () => {
      if (!routingPlan) return

      // Draw route polyline from all leg coordinates
      const coordinates = routingPlan.legs.flatMap(
        (leg) => leg.polyline.coordinates as [number, number][]
      )

      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } },
      })

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#3B82F6', 'line-width': 4 },
      })

      // Add charging stop markers
      for (const stop of routingPlan.chargingStops) {
        new mapboxgl.Marker({ color: '#10B981' })
          .setLngLat(stop.location)
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<b>${stop.chargerType}</b><br/>${stop.estimatedDurationMinutes} min`
            )
          )
          .addTo(map)
      }
    })

    return () => map.remove()
  }, [routingPlan])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100dvh' }}
      aria-label="Route map"
    />
  )
}

export default RoutingPlanMap
