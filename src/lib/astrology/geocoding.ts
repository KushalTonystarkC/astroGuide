import { GeocodingError } from "@/lib/astrology/errors"
import type { Geocoder, Location } from "@/lib/astrology/types"
import { GoogleMapsGeocoder } from "@/lib/astrology/providers/geocoding/google-maps"
import { MapTilerGeocoder } from "@/lib/astrology/providers/geocoding/maptiler"
import {
  OpenStreetMapGeocoder,
  type PlaceSuggestion,
} from "@/lib/astrology/providers/geocoding/openstreetmap"
import { resolveTimezone } from "@/lib/astrology/providers/geocoding/timezone"

export type { PlaceSuggestion }

export type GeocodingProviderName = "openstreetmap" | "maptiler" | "google"

export interface GeocodingConfig {
  provider?: GeocodingProviderName
}

function createGeocoder(provider: GeocodingProviderName): Geocoder {
  switch (provider) {
    case "maptiler":
      return new MapTilerGeocoder()
    case "google":
      return new GoogleMapsGeocoder()
    case "openstreetmap":
    default:
      return new OpenStreetMapGeocoder()
  }
}

export function getGeocodingProviderName(): GeocodingProviderName {
  const env = process.env.GEOCODING_PROVIDER?.toLowerCase()
  if (env === "maptiler" || env === "google" || env === "openstreetmap") {
    return env
  }
  return "openstreetmap"
}

export function createGeocodingService(
  config: GeocodingConfig = {}
): Geocoder {
  const provider = config.provider ?? getGeocodingProviderName()
  return createGeocoder(provider)
}

/**
 * Geocode a place and resolve IANA timezone for birth-time conversion.
 */
export async function geocodePlace(
  place: string,
  config?: GeocodingConfig
): Promise<Location> {
  const trimmed = place.trim()
  if (!trimmed) {
    throw new GeocodingError("Birth place is required")
  }

  const geocoder = createGeocodingService(config)
  const base = await geocoder.geocode(trimmed)

  if (base.timezone) {
    return base
  }

  const timezone = await resolveTimezone(base.latitude, base.longitude)
  return { ...base, timezone }
}

/**
 * Search for place suggestions via OpenStreetMap Nominatim.
 */
export async function searchPlaces(
  query: string,
  limit = 5
): Promise<PlaceSuggestion[]> {
  const provider = getGeocodingProviderName()
  if (provider !== "openstreetmap") {
    throw new GeocodingError(
      "Place search is only available with the OpenStreetMap geocoding provider"
    )
  }

  return new OpenStreetMapGeocoder().search(query, limit)
}
