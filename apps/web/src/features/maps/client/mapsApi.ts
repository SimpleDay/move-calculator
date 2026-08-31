import type { AddressSuggestion, DrivingRoute, SelectedPlace } from '@/features/maps/model/types'

export class MapsRequestError extends Error {
  readonly code: string | null

  constructor(message: string, code: string | null = null) {
    super(message)
    this.name = 'MapsRequestError'
    this.code = code
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { code?: string; message?: string } | null
    throw new MapsRequestError(error?.message ?? 'Google Maps ist momentan nicht verfügbar.', error?.code ?? null)
  }
  return (await response.json()) as T
}

export async function autocompleteAddress(input: string, sessionToken: string): Promise<AddressSuggestion[]> {
  const response = await post<{ suggestions: AddressSuggestion[] }>('/api/maps/autocomplete', {
    input,
    sessionToken,
  })
  return response.suggestions
}

export async function selectAddress(placeId: string, sessionToken: string): Promise<SelectedPlace> {
  return await post<SelectedPlace>('/api/maps/place', { placeId, sessionToken })
}

export async function calculateDrivingRoute(originPlaceId: string, destinationPlaceId: string): Promise<DrivingRoute> {
  return await post<DrivingRoute>('/api/maps/route', { originPlaceId, destinationPlaceId })
}
