'use client'

import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import type { TripProfile } from '../types'
import { redistributeProfile } from '../lib/tripProfileConstraint'

interface TripProfileEditorProps {
  profile: TripProfile
  onChange: (profile: TripProfile) => void
}

// Triangle geometry helpers
// Vertices are at the top (reliability), bottom-left (safety), bottom-right (speed)
const SIZE = 280
const PADDING = 48
const CX = SIZE / 2
const CY = SIZE / 2

// Equilateral triangle vertices (reliability=top, safety=bottom-left, speed=bottom-right)
const TRIANGLE_RADIUS = (SIZE / 2 - PADDING)
const VERTICES: Record<keyof TripProfile, [number, number]> = {
  reliability: [CX, CY - TRIANGLE_RADIUS],
  safety: [CX - TRIANGLE_RADIUS * Math.sin(Math.PI / 3), CY + TRIANGLE_RADIUS * 0.5],
  speed: [CX + TRIANGLE_RADIUS * Math.sin(Math.PI / 3), CY + TRIANGLE_RADIUS * 0.5],
}

/**
 * Convert barycentric-like profile values to an (x, y) point inside the triangle.
 * profile values are weights (sum to 100), so normalized they become barycentric coords.
 */
function profileToPoint(profile: TripProfile): [number, number] {
  const total = profile.reliability + profile.safety + profile.speed || 100
  const wR = profile.reliability / total
  const wS = profile.safety / total
  const wSp = profile.speed / total

  const x = wR * VERTICES.reliability[0] + wS * VERTICES.safety[0] + wSp * VERTICES.speed[0]
  const y = wR * VERTICES.reliability[1] + wS * VERTICES.safety[1] + wSp * VERTICES.speed[1]
  return [x, y]
}

/**
 * Given a point (x, y), find the closest vertex and how far toward it the point is,
 * then call redistributeProfile accordingly.
 */
function pointToProfile(x: number, y: number): TripProfile {
  const axes = Object.keys(VERTICES) as Array<keyof TripProfile>

  // Find barycentric coordinates relative to the triangle
  // Using the formula for a triangle with vertices A, B, C
  const [ax, ay] = VERTICES.reliability
  const [bx, by] = VERTICES.safety
  const [cx, cy] = VERTICES.speed

  const denom = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
  const wR = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / denom
  const wS = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / denom
  const wSp = 1 - wR - wS

  // Clamp to [0,1] to stay inside triangle
  const raw = {
    reliability: Math.max(0, wR),
    safety: Math.max(0, wS),
    speed: Math.max(0, wSp),
  }

  // Renormalize so sum = 1
  const sum = raw.reliability + raw.safety + raw.speed
  const normalized = {
    reliability: raw.reliability / sum,
    safety: raw.safety / sum,
    speed: raw.speed / sum,
  }

  // Convert to 0-100 values (rounded to avoid floating point drift)
  return {
    reliability: Math.round(normalized.reliability * 100),
    safety: Math.round(normalized.safety * 100),
    speed: Math.round(normalized.speed * 100),
  }
}

/** Clamp point to be inside triangle */
function clampToTriangle(x: number, y: number): [number, number] {
  // Use barycentric coords to clamp
  const [ax, ay] = VERTICES.reliability
  const [bx, by] = VERTICES.safety
  const [cx, cy] = VERTICES.speed

  const denom = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
  let wR = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / denom
  let wS = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / denom
  let wSp = 1 - wR - wS

  wR = Math.max(0, wR)
  wS = Math.max(0, wS)
  wSp = Math.max(0, wSp)

  const sum = wR + wS + wSp
  wR /= sum
  wS /= sum
  wSp /= sum

  return [
    wR * ax + wS * bx + wSp * cx,
    wR * ay + wS * by + wSp * cy,
  ]
}

export function TripProfileEditor({ profile, onChange }: TripProfileEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const trianglePoints = [
      VERTICES.reliability,
      VERTICES.safety,
      VERTICES.speed,
    ]

    // Draw triangle
    svg
      .append('polygon')
      .attr('points', trianglePoints.map((p) => p.join(',')).join(' '))
      .attr('fill', 'none')
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 2)

    // Draw axis lines from centroid to vertices (subtle guides)
    const centroid: [number, number] = [CX, CY]
    for (const [vx, vy] of Object.values(VERTICES)) {
      svg
        .append('line')
        .attr('x1', centroid[0])
        .attr('y1', centroid[1])
        .attr('x2', vx)
        .attr('y2', vy)
        .attr('stroke', '#9CA3AF')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
    }

    // Label offsets
    const labelOffsets: Record<keyof TripProfile, [number, number]> = {
      reliability: [0, -14],
      safety: [-14, 14],
      speed: [14, 14],
    }
    const labels: Record<keyof TripProfile, string> = {
      reliability: 'Reliability',
      safety: 'Safety',
      speed: 'Speed',
    }

    for (const axis of Object.keys(VERTICES) as Array<keyof TripProfile>) {
      const [vx, vy] = VERTICES[axis]
      const [ox, oy] = labelOffsets[axis]

      svg
        .append('text')
        .attr('x', vx + ox)
        .attr('y', vy + oy)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .attr('fill', '#1F2937')
        .text(labels[axis])

      svg
        .append('text')
        .attr('x', vx + ox)
        .attr('y', vy + oy + 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#6B7280')
        .text(`${profile[axis]}`)
    }

    // Control point
    const [cpx, cpy] = profileToPoint(profile)

    const dragBehavior = d3
      .drag<SVGCircleElement, unknown>()
      .on('drag', (event) => {
        const [cx2, cy2] = clampToTriangle(event.x, event.y)
        const newProfile = pointToProfile(cx2, cy2)
        // Ensure sum is exactly 100 (fix rounding)
        const diff = 100 - (newProfile.reliability + newProfile.safety + newProfile.speed)
        newProfile.reliability += diff
        onChange(newProfile)
      })

    const circle = svg
      .append('circle')
      .attr('cx', cpx)
      .attr('cy', cpy)
      .attr('r', 20) // touch-friendly 40px diameter
      .attr('fill', '#3B82F6')
      .attr('fill-opacity', 0.15)
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)
      .attr('cursor', 'grab')
      .attr('aria-label', 'Drag to adjust trip profile')

    circle.call(dragBehavior)

    // Inner dot
    svg
      .append('circle')
      .attr('cx', cpx)
      .attr('cy', cpy)
      .attr('r', 6)
      .attr('fill', '#3B82F6')
      .attr('pointer-events', 'none')
  }, [profile, onChange])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: SIZE,
        margin: '0 auto',
        touchAction: 'none',
      }}
      role="group"
      aria-label="Trip Profile Editor"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%"
        style={{ display: 'block' }}
      />
    </div>
  )
}

export default TripProfileEditor
