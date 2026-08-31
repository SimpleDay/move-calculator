import { getGoogleMapsService, MapsProviderError } from '@/features/maps/providers/googleMapsService'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  originPlaceId: z.string().min(1).max(300),
  destinationPlaceId: z.string().min(1).max(300),
})

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ message: 'Start und Ziel sind ungültig.' }, { status: 400 })
  }
  const maps = getGoogleMapsService()
  if (!maps) {
    return NextResponse.json({ code: 'MAPS_NOT_CONFIGURED' }, { status: 503 })
  }
  try {
    return NextResponse.json(await maps.computeDrivingRoute(parsed.data.originPlaceId, parsed.data.destinationPlaceId))
  } catch (error) {
    if (error instanceof MapsProviderError || error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Die Route konnte nicht berechnet werden.' }, { status: 502 })
    }
    throw error
  }
}
