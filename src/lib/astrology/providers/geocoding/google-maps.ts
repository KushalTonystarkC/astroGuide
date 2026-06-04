import { GeocodingError } from "@/lib/astrology/errors"
import type { Geocoder, Location } from "@/lib/astrology/types"

interface GoogleGeocodeResult {
  geometry: { location: { lat: number; lng: number } }
  formatted_address: string
}

interface GoogleGeocodeResponse {
  status: string
  results: GoogleGeocodeResult[]
  error_message?: string
}

/**
 * Google Maps Geocoding API provider.
 * Requires GOOGLE_MAPS_API_KEY environment variable.
 */
export class GoogleMapsGeocoder implements Geocoder {
  async geocode(place: string): Promise<Location> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      throw new GeocodingError(
        "Google Maps geocoder requires GOOGLE_MAPS_API_KEY environment variable"
      )
    }

    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    url.searchParams.set("address", place)
    url.searchParams.set("key", apiKey)

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new GeocodingError(
        `Google Maps geocoding failed (${response.status})`
      )
    }

    const data = (await response.json()) as GoogleGeocodeResponse

    if (data.status !== "OK" || !data.results?.length) {
      throw new GeocodingError(
        data.error_message ??
          `Could not find location: "${place}" (${data.status})`
      )
    }

    const [first] = data.results

    return {
      latitude: first.geometry.location.lat,
      longitude: first.geometry.location.lng,
      timezone: "",
      displayName: first.formatted_address,
    }
  }
}
