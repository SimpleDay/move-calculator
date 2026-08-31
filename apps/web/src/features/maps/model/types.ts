export type AddressSuggestion = {
  placeId: string
  fullText: string
  mainText: string
  secondaryText: string
}

export type SelectedPlace = {
  placeId: string
  formattedAddress: string
  location: {
    latitude: number
    longitude: number
  }
}

export type DrivingRoute = {
  distanceKm: number
  distanceMeters: number
  durationMinutes: number
}

export type MapsService = {
  autocompleteAddress: (input: string, sessionToken: string) => Promise<AddressSuggestion[]>
  getPlace: (placeId: string, sessionToken: string) => Promise<SelectedPlace>
  computeDrivingRoute: (originPlaceId: string, destinationPlaceId: string) => Promise<DrivingRoute>
}
