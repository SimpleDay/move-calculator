import type { AddressSuggestion, DrivingRoute, MapsService, SelectedPlace } from '@/features/maps/model/types'
import { z } from 'zod'

const autocompleteResponseSchema = z.object({
  suggestions: z
    .array(
      z.object({
        placePrediction: z
          .object({
            placeId: z.string(),
            text: z.object({ text: z.string() }),
            structuredFormat: z
              .object({
                mainText: z.object({ text: z.string() }),
                secondaryText: z.object({ text: z.string() }).optional(),
              })
              .optional(),
          })
          .optional(),
      }),
    )
    .default([]),
})

const placeResponseSchema = z.object({
  id: z.string(),
  formattedAddress: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
})

const routeResponseSchema = z.object({
  routes: z.array(
    z.object({
      distanceMeters: z.number().int().min(0),
      duration: z.string().regex(/^\d+(?:\.\d+)?s$/),
    }),
  ),
})

type GoogleMapsServiceOptions = {
  apiKey: string
  fetchFn?: typeof fetch
}

export class MapsProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MapsProviderError'
  }
}

async function requestJson(fetchPromise: Promise<Response>): Promise<unknown> {
  const response = await fetchPromise
  if (!response.ok) {
    throw new MapsProviderError(`Google Maps request failed with status ${response.status}.`)
  }
  return await response.json()
}

export function createGoogleMapsService({ apiKey, fetchFn = fetch }: GoogleMapsServiceOptions): MapsService {
  const headers = {
    'content-type': 'application/json',
    'X-Goog-Api-Key': apiKey,
  }

  return {
    async autocompleteAddress(input, sessionToken): Promise<AddressSuggestion[]> {
      const response = autocompleteResponseSchema.parse(
        await requestJson(
          fetchFn('https://places.googleapis.com/v1/places:autocomplete', {
            method: 'POST',
            headers: {
              ...headers,
              'X-Goog-FieldMask':
                'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text',
            },
            body: JSON.stringify({
              input,
              includedRegionCodes: ['ch', 'li'],
              languageCode: 'de',
              regionCode: 'ch',
              sessionToken,
            }),
          }),
        ),
      )
      return response.suggestions.flatMap(({ placePrediction }) => {
        if (!placePrediction) {
          return []
        }
        return [
          {
            placeId: placePrediction.placeId,
            fullText: placePrediction.text.text,
            mainText: placePrediction.structuredFormat?.mainText.text ?? placePrediction.text.text,
            secondaryText: placePrediction.structuredFormat?.secondaryText?.text ?? '',
          },
        ]
      })
    },

    async getPlace(placeId, sessionToken): Promise<SelectedPlace> {
      const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`)
      url.searchParams.set('languageCode', 'de')
      url.searchParams.set('regionCode', 'ch')
      url.searchParams.set('sessionToken', sessionToken)
      const place = placeResponseSchema.parse(
        await requestJson(
          fetchFn(url, {
            headers: {
              ...headers,
              'X-Goog-FieldMask': 'id,formattedAddress,location',
            },
          }),
        ),
      )
      return {
        placeId: place.id,
        formattedAddress: place.formattedAddress,
        location: place.location,
      }
    },

    async computeDrivingRoute(originPlaceId, destinationPlaceId): Promise<DrivingRoute> {
      const response = routeResponseSchema.parse(
        await requestJson(
          fetchFn('https://routes.googleapis.com/directions/v2:computeRoutes', {
            method: 'POST',
            headers: {
              ...headers,
              'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
            },
            body: JSON.stringify({
              origin: { placeId: originPlaceId },
              destination: { placeId: destinationPlaceId },
              travelMode: 'DRIVE',
              routingPreference: 'TRAFFIC_AWARE',
              computeAlternativeRoutes: false,
              languageCode: 'de-CH',
              units: 'METRIC',
            }),
          }),
        ),
      )
      const route = response.routes[0]
      if (!route) {
        throw new MapsProviderError('Google Maps returned no driving route.')
      }
      const durationSeconds = Number.parseFloat(route.duration.slice(0, -1))
      return {
        distanceKm: Math.round(route.distanceMeters / 100) / 10,
        distanceMeters: route.distanceMeters,
        durationMinutes: Math.ceil(durationSeconds / 60),
      }
    },
  }
}

export function getGoogleMapsService(): MapsService | null {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY?.trim()
  return apiKey ? createGoogleMapsService({ apiKey }) : null
}
