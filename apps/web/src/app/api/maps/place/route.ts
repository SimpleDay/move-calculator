import { getGoogleMapsService, MapsProviderError } from '@/features/maps/providers/googleMapsService'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  placeId: z.string().min(1).max(300),
  sessionToken: z.string().uuid(),
})

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ message: 'Die ausgewählte Adresse ist ungültig.' }, { status: 400 })
  }
  const maps = getGoogleMapsService()
  if (!maps) {
    return NextResponse.json({ code: 'MAPS_NOT_CONFIGURED' }, { status: 503 })
  }
  try {
    return NextResponse.json(await maps.getPlace(parsed.data.placeId, parsed.data.sessionToken))
  } catch (error) {
    if (error instanceof MapsProviderError || error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Die Adresse konnte nicht validiert werden.' }, { status: 502 })
    }
    throw error
  }
}
