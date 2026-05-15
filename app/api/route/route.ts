import { NextRequest, NextResponse } from 'next/server'
import { handleRouteRequest } from '../../../lib/routeHandler'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await handleRouteRequest(body)
  return NextResponse.json(result.data, { status: result.status })
}
