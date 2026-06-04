import { getMoonNakshatra } from "@/lib/astrology/nakshatra"
import { buildPlanetPositions, findPlanetLongitude } from "@/lib/astrology/planets"
import { getSignFromLongitude } from "@/lib/astrology/zodiac"
import { buildHousePositions } from "@/lib/astrology/houses"
import type { KundliChart, RawChartData } from "@/lib/astrology/types"

/**
 * Assembles a KundliChart from raw sidereal ephemeris data.
 * All sign/nakshatra/house assignments use pure calculation functions.
 */
export function assembleKundliChart(raw: RawChartData): KundliChart {
  const { ascendantLongitude, positions } = raw
  const moonLongitude = findPlanetLongitude(positions, "Moon")

  if (moonLongitude === undefined) {
    throw new Error("Moon longitude is required to build a Kundli chart")
  }

  return {
    lagna: getSignFromLongitude(ascendantLongitude),
    moonSign: getSignFromLongitude(moonLongitude),
    nakshatra: getMoonNakshatra(moonLongitude),
    planets: buildPlanetPositions(positions, ascendantLongitude),
    houses: buildHousePositions(ascendantLongitude),
  }
}
