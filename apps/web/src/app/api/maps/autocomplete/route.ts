import { getGoogleMapsService, MapsProviderError } from '@/features/maps/providers/googleMapsService'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  input: z.string().trim().min(3).max(200),
  sessionToken: z.string().uuid(),
})

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ message: 'Bitte geben Sie mindestens drei Zeichen ein.' }, { status: 400 })
  }
  const maps = getGoogleMapsService()
  if (!maps) {
    return NextResponse.json(
      { code: 'MAPS_NOT_CONFIGURED', message: 'Die automatische Adresssuche ist noch nicht konfiguriert.' },
      { status: 503 },
    )
  }
  try {
    return NextResponse.json({
      suggestions: await maps.autocompleteAddress(parsed.data.input, parsed.data.sessionToken),
    })
  } catch (error) {
    if (error instanceof MapsProviderError || error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Die Adresssuche ist momentan nicht verfügbar.' }, { status: 502 })
    }
    throw error
  }
}
