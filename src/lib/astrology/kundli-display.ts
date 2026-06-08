import { DEGREES_PER_SIGN } from "@/lib/astrology/constants"
import { getNakshatraFromLongitude } from "@/lib/astrology/nakshatra"
import { getRashiEnglishName, getRashiIndex } from "@/lib/astrology/zodiac"
import type { PlanetPosition } from "@/lib/astrology/types"

const PLANET_ABBREVIATIONS: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
}

export function getPlanetAbbreviation(planet: string): string {
  return PLANET_ABBREVIATIONS[planet] ?? planet.slice(0, 2)
}

export function getSignNumber(sign: string): number {
  return getRashiIndex(sign) + 1
}

export function getPlanetLongitude(planet: PlanetPosition): number {
  return getRashiIndex(planet.sign) * DEGREES_PER_SIGN + planet.degree
}

export function getPlanetNakshatra(planet: PlanetPosition) {
  return getNakshatraFromLongitude(getPlanetLongitude(planet))
}

export interface EnrichedPlanetRow extends PlanetPosition {
  signNumber: number
  signEnglish: string
  nakshatraName: string
  nakshatraPada: number
  degreeRounded: number
}

export function enrichPlanetRows(planets: PlanetPosition[]): EnrichedPlanetRow[] {
  return planets.map((planet) => {
    const nakshatra = getPlanetNakshatra(planet)
    return {
      ...planet,
      signNumber: getSignNumber(planet.sign),
      signEnglish: getRashiEnglishName(planet.sign),
      nakshatraName: nakshatra.name,
      nakshatraPada: nakshatra.pada,
      degreeRounded: Math.round(planet.degree),
    }
  })
}
