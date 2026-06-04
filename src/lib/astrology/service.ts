import { geocodePlace } from "@/lib/astrology/geocoding"
import { ensureSwissEphemerisRegistered } from "@/lib/astrology/register-ephemeris"
import { createAstrologyProvider } from "@/lib/astrology/providers"
import type {
  AstrologyProvider,
  BirthDetails,
  Geocoder,
  KundliChart,
} from "@/lib/astrology/types"

export interface GenerateKundliOptions {
  geocoder?: Geocoder
  astrologyProvider?: AstrologyProvider
}

/**
 * Server-side Kundli generation orchestration.
 * Geocodes birth place, then delegates chart calculation to the astrology provider.
 */
export async function generateKundliServer(
  input: BirthDetails,
  options: GenerateKundliOptions = {}
): Promise<KundliChart> {
  await ensureSwissEphemerisRegistered()

  const location = options.geocoder
    ? await options.geocoder.geocode(input.place)
    : await geocodePlace(input.place)

  const provider =
    options.astrologyProvider ?? createAstrologyProvider()

  return provider.generateChart(input, location)
}
