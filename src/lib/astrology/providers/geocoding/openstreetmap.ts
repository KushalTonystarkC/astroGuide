import { GeocodingError } from "@/lib/astrology/errors"
import type { Geocoder, Location } from "@/lib/astrology/types"

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

/**
 * OpenStreetMap Nominatim geocoder (no API key required).
 * Respect usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */
export class OpenStreetMapGeocoder implements Geocoder {
  async geocode(place: string): Promise<Location> {
    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.set("q", place)
    url.searchParams.set("format", "json")
    url.searchParams.set("limit", "1")

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": process.env.NOMINATIM_USER_AGENT ?? "AstroGuide/1.0",
      },
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      throw new GeocodingError(
        `OpenStreetMap geocoding failed (${response.status})`
      )
    }

    const results = (await response.json()) as NominatimResult[]

    if (!results.length) {
      throw new GeocodingError(`Could not find location: "${place}"`)
    }

    const [first] = results
    const latitude = Number(first.lat)
    const longitude = Number(first.lon)

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new GeocodingError("Invalid coordinates returned from geocoder")
    }

    return {
      latitude,
      longitude,
      timezone: "",
      displayName: first.display_name,
    }
  }
}
