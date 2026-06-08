import { assembleKundliChart } from "@/lib/astrology/chart"
import { DEFAULT_AYANAMSA } from "@/lib/astrology/constants"
import { parseBirthDateTime, toJulianDayUt } from "@/lib/astrology/datetime"
import { AstrologyProviderNotConfiguredError } from "@/lib/astrology/errors"
import type {
  AstrologyProvider,
  BirthDetails,
  KundliChart,
  Location,
  SwissEphemerisAdapter,
} from "@/lib/astrology/types"

export type AstrologyProviderName =
  | "vedic-calc"
  | "swiss-ephemeris"
  | "prokerala"
  | "astrology-api"

/**
 * Swiss Ephemeris provider — delegates sidereal calculations to an injected adapter.
 *
 * Integration steps (next phase):
 * 1. Install a maintained Swiss Ephemeris binding (e.g. sweph, swisseph-v2).
 * 2. Implement SwissEphemerisAdapter.calculateSiderealChart():
 *    - Set sidereal mode / Lahiri ayanamsa
 *    - Compute planet longitudes for julianDayUt
 *    - Compute ascendant with latitude, longitude, and house system
 * 3. Register the adapter: setSwissEphemerisAdapter(yourAdapter)
 *    or pass SWISS_EPHEMERIS_ADAPTER via dependency injection in tests.
 */
export class SwissEphemerisAstrologyProvider implements AstrologyProvider {
  constructor(private readonly adapter: SwissEphemerisAdapter | null = null) {
    this.adapter = adapter ?? getRegisteredAdapter()
  }

  async generateChart(
    birthDetails: BirthDetails,
    location: Location
  ): Promise<KundliChart> {
    if (!this.adapter) {
      throw new AstrologyProviderNotConfiguredError("Swiss Ephemeris")
    }

    const birthUtc = parseBirthDateTime(
      birthDetails.date,
      birthDetails.time,
      location.timezone
    )
    const julianDayUt = toJulianDayUt(birthUtc)

    const raw = await this.adapter.calculateSiderealChart({
      julianDayUt,
      latitude: location.latitude,
      longitude: location.longitude,
      ayanamsa: DEFAULT_AYANAMSA,
    })

    return assembleKundliChart(raw)
  }
}

let registeredAdapter: SwissEphemerisAdapter | null = null

export function setSwissEphemerisAdapter(
  adapter: SwissEphemerisAdapter | null
): void {
  registeredAdapter = adapter
}

export function getRegisteredAdapter(): SwissEphemerisAdapter | null {
  return registeredAdapter
}

export function createSwissEphemerisProvider(
  adapter?: SwissEphemerisAdapter | null
): SwissEphemerisAstrologyProvider {
  return new SwissEphemerisAstrologyProvider(adapter ?? null)
}
