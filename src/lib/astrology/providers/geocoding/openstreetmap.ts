import { GeocodingError } from "@/lib/astrology/errors"
import type { Geocoder, Location, PlaceSuggestion } from "@/lib/astrology/types"

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": process.env.NOMINATIM_USER_AGENT ?? "AstroGuide/1.0",
} as const

/**
 * OpenStreetMap Nominatim geocoder (no API key required).
 * Respect usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */
export class OpenStreetMapGeocoder implements Geocoder {
  async searchPlaces(
    query: string,
    limit = 5
  ): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim()
    if (!trimmed) return []

    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.set("q", trimmed)
    url.searchParams.set("format", "json")
    url.searchParams.set("limit", String(limit))
    url.searchParams.set("addressdetails", "0")

    const response = await fetch(url.toString(), {
      headers: NOMINATIM_HEADERS,
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      throw new GeocodingError(
        `OpenStreetMap search failed (${response.status})`
      )
    }

    const results = (await response.json()) as NominatimResult[]

    return results
      .map((result) => {
        const latitude = Number(result.lat)
        const longitude = Number(result.lon)
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null
        return {
          displayName: result.display_name,
          latitude,
          longitude,
        }
      })
      .filter((entry): entry is PlaceSuggestion => entry !== null)
  }

  async geocode(place: string): Promise<Location> {
    const results = await this.searchPlaces(place, 1)

    if (!results.length) {
      throw new GeocodingError(`Could not find location: "${place}"`)
    }

    const [first] = results
    return {
      latitude: first.latitude,
      longitude: first.longitude,
      timezone: "",
      displayName: first.displayName,
    }
  }
}
