import { describe, expect, test, vi } from 'vitest'
import { createGoogleMapsService } from './googleMapsService'

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

describe('Google Maps service', () => {
  test('maps address predictions to the provider-neutral contract', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({
        suggestions: [
          {
            placePrediction: {
              placeId: 'place-bern',
              text: { text: 'Spitalgasse 12, 3011 Bern' },
              structuredFormat: {
                mainText: { text: 'Spitalgasse 12' },
                secondaryText: { text: '3011 Bern' },
              },
            },
          },
        ],
      }),
    )
    const service = createGoogleMapsService({ apiKey: 'test-key', fetchFn })

    await expect(service.autocompleteAddress('Spitalgasse', 'session-1')).resolves.toEqual([
      {
        placeId: 'place-bern',
        fullText: 'Spitalgasse 12, 3011 Bern',
        mainText: 'Spitalgasse 12',
        secondaryText: '3011 Bern',
      },
    ])
    expect(fetchFn).toHaveBeenCalledWith(
      'https://places.googleapis.com/v1/places:autocomplete',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  test('normalizes route distance and duration for deterministic pricing', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ routes: [{ distanceMeters: 28_412, duration: '2131s' }] }))
    const service = createGoogleMapsService({ apiKey: 'test-key', fetchFn })

    await expect(service.computeDrivingRoute('from', 'to')).resolves.toEqual({
      distanceKm: 28.4,
      distanceMeters: 28_412,
      durationMinutes: 36,
    })
  })
})
