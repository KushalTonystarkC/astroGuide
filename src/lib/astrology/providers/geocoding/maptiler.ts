import { GeocodingError } from "@/lib/astrology/errors"
import type { Geocoder, Location } from "@/lib/astrology/types"

interface MapTilerFeature {
  geometry: { coordinates: [number, number] }
  place_name?: string
}

interface MapTilerResponse {
  features: MapTilerFeature[]
}

/**
 * MapTiler Geocoding API provider.
 * Requires MAPTILER_API_KEY environment variable.
 */
export class MapTilerGeocoder implements Geocoder {
  async geocode(place: string): Promise<Location> {
    const apiKey = process.env.MAPTILER_API_KEY
    if (!apiKey) {
      throw new GeocodingError(
        "MapTiler geocoder requires MAPTILER_API_KEY environment variable"
      )
    }

    const url = new URL(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(place)}.json`
    )
    url.searchParams.set("key", apiKey)
    url.searchParams.set("limit", "1")

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new GeocodingError(`MapTiler geocoding failed (${response.status})`)
    }

    const data = (await response.json()) as MapTilerResponse
    const feature = data.features?.[0]

    if (!feature) {
      throw new GeocodingError(`Could not find location: "${place}"`)
    }

    const [longitude, latitude] = feature.geometry.coordinates

    return {
      latitude,
      longitude,
      timezone: "",
      displayName: feature.place_name,
    }
  }
}
