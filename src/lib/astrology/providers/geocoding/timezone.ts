import { GeocodingError } from "@/lib/astrology/errors"

interface TimeApiResponse {
  timeZone?: string
}

/**
 * Resolves IANA timezone from coordinates via timeapi.io (no API key).
 */
export async function resolveTimezone(
  latitude: number,
  longitude: number
): Promise<string> {
  const url = new URL("https://timeapi.io/api/TimeZone/coordinate")
  url.searchParams.set("latitude", String(latitude))
  url.searchParams.set("longitude", String(longitude))

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  })

  if (!response.ok) {
    throw new GeocodingError(
      `Timezone lookup failed (${response.status}) for coordinates (${latitude}, ${longitude})`
    )
  }

  const data = (await response.json()) as TimeApiResponse

  if (!data.timeZone) {
    throw new GeocodingError("Timezone could not be resolved for birth place")
  }

  return data.timeZone
}
