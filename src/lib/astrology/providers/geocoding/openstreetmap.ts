import { GeocodingError } from "@/lib/astrology/errors"
import type { Geocoder, Location } from "@/lib/astrology/types"

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  place_id: number
}

export interface PlaceSuggestion {
  displayName: string
  latitude: number
  longitude: number
}

function nominatimHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "User-Agent": process.env.NOMINATIM_USER_AGENT ?? "AstroGuide/1.0",
  }
}

function parseNominatimResult(result: NominatimResult): PlaceSuggestion {
  const latitude = Number(result.lat)
  const longitude = Number(result.lon)

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new GeocodingError("Invalid coordinates returned from geocoder")
  }

  return {
    displayName: result.display_name,
    latitude,
    longitude,
  }
}

async function fetchNominatimResults(
  query: string,
  limit: number
): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", query)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", String(limit))

  const response = await fetch(url.toString(), {
    headers: nominatimHeaders(),
    next: { revalidate: 86400 },
  })

  if (!response.ok) {
    throw new GeocodingError(
      `OpenStreetMap geocoding failed (${response.status})`
    )
  }

  return (await response.json()) as NominatimResult[]
}

/**
 * OpenStreetMap Nominatim geocoder (no API key required).
 * Respect usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */
export class OpenStreetMapGeocoder implements Geocoder {
  async search(query: string, limit = 5): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      return []
    }

    const results = await fetchNominatimResults(trimmed, limit)
    return results.map(parseNominatimResult)
  }

  async geocode(place: string): Promise<Location> {
    const results = await fetchNominatimResults(place, 1)

    if (!results.length) {
      throw new GeocodingError(`Could not find location: "${place}"`)
    }

    const suggestion = parseNominatimResult(results[0])

    return {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      timezone: "",
      displayName: suggestion.displayName,
    }
  }
}
