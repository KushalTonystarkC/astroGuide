import { normalizeDegree } from "@/lib/astrology/calculations"
import { AstrologyProviderError } from "@/lib/astrology/errors"
import { resolveEphemerisPath } from "@/lib/astrology/ephemeris-config"
import type {
  AyanamsaType,
  RawChartData,
  SwissEphemerisAdapter,
  SwissEphemerisChartParams,
} from "@/lib/astrology/types"
import { SEVEN_GRAHAS } from "@/data/planets"

type SwephModule = typeof import("sweph")

const AYANAMSA_MAP: Record<AyanamsaType, number> = {
  lahiri: 1,
  raman: 3,
  krishnamurti: 5,
  yukteshwar: 7,
}

const PLANET_IDS: Record<(typeof SEVEN_GRAHAS)[number], number> = {
  Sun: 0,
  Moon: 1,
  Mercury: 2,
  Venus: 3,
  Mars: 4,
  Jupiter: 5,
  Saturn: 6,
}

let swephModule: SwephModule | null = null

async function loadSweph(): Promise<SwephModule> {
  if (!swephModule) {
    swephModule = await import("sweph")
  }
  return swephModule
}

function configureEphemeris(sweph: SwephModule): void {
  const ephePath = resolveEphemerisPath()
  if (ephePath) {
    sweph.set_ephe_path(ephePath)
  }
}

function getCalculationFlags(sweph: SwephModule): number {
  const { constants } = sweph
  const useFiles = Boolean(resolveEphemerisPath())
  const ephemerisFlag = useFiles
    ? constants.SEFLG_SWIEPH
    : constants.SEFLG_MOSEPH
  return ephemerisFlag | constants.SEFLG_SIDEREAL | constants.SEFLG_SPEED
}

function assertOk(flag: number, error: string | undefined, context: string): void {
  const sweph = swephModule!
  if (flag === sweph.constants.ERR) {
    throw new AstrologyProviderError(
      error ?? `Swiss Ephemeris calculation failed: ${context}`
    )
  }
}

/**
 * Node adapter for the official Swiss Ephemeris C library (Astrodienst).
 *
 * - C source & ephemeris files: https://github.com/aloistr/swisseph
 * - Node bindings used here: npm package `sweph` (wraps the same swe_* API)
 *
 * Install: npm install sweph
 * Data files: npm run setup:ephemeris  (downloads from aloistr/swisseph/ephe)
 *            then set SWEPH_EPHE_PATH=./ephemeris
 *
 * Without SWEPH_EPHE_PATH, built-in Moshier ephemeris is used (lower precision).
 */
export function createSwephAdapter(): SwissEphemerisAdapter {
  return {
    async calculateSiderealChart(
      params: SwissEphemerisChartParams
    ): Promise<RawChartData> {
      const sweph = await loadSweph()
      configureEphemeris(sweph)

      const sidMode = AYANAMSA_MAP[params.ayanamsa] ?? AYANAMSA_MAP.lahiri
      sweph.set_sid_mode(sidMode, 0, 0)

      const iflag = getCalculationFlags(sweph)
      const positions: RawChartData["positions"] = []

      for (const planet of SEVEN_GRAHAS) {
        const result = sweph.calc_ut(
          params.julianDayUt,
          PLANET_IDS[planet],
          iflag
        )
        assertOk(result.flag, result.error, planet)
        positions.push({
          planet,
          longitude: normalizeDegree(result.data[0]),
        })
      }

      const rahuResult = sweph.calc_ut(
        params.julianDayUt,
        sweph.constants.SE_MEAN_NODE,
        iflag
      )
      assertOk(rahuResult.flag, rahuResult.error, "Rahu")
      const rahuLongitude = normalizeDegree(rahuResult.data[0])
      positions.push({ planet: "Rahu", longitude: rahuLongitude })
      positions.push({
        planet: "Ketu",
        longitude: normalizeDegree(rahuLongitude + 180),
      })

      const houses = sweph.houses_ex2(
        params.julianDayUt,
        iflag,
        params.latitude,
        params.longitude,
        "W"
      )
      assertOk(houses.flag, houses.error, "Ascendant")

      const ascendantLongitude = normalizeDegree(houses.data.points[0])

      return { ascendantLongitude, positions }
    },
  }
}
