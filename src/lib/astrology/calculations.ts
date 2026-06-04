import { NAKSHATRAS } from "@/data/nakshatras"
import { RASHIS, type RashiName } from "@/data/zodiac-signs"
import {
  DEGREES_PER_NAKSHATRA,
  DEGREES_PER_PADA,
  DEGREES_PER_SIGN,
  FULL_CIRCLE_DEGREES,
  HOUSES_COUNT,
  PADAS_PER_NAKSHATRA,
} from "@/lib/astrology/constants"
import type { NakshatraInfo, PlanetPosition } from "@/lib/astrology/types"

/**
 * Pure calculation utilities — no side effects, unit-test friendly.
 */

export function normalizeDegree(degree: number): number {
  const normalized = degree % FULL_CIRCLE_DEGREES
  return normalized < 0 ? normalized + FULL_CIRCLE_DEGREES : normalized
}

export function getSignIndex(longitude: number): number {
  const normalized = normalizeDegree(longitude)
  return Math.floor(normalized / DEGREES_PER_SIGN) % RASHIS.length
}

export function getSignFromLongitude(longitude: number): RashiName {
  return RASHIS[getSignIndex(longitude)]
}

export function getDegreeInSign(longitude: number): number {
  const normalized = normalizeDegree(longitude)
  return normalized % DEGREES_PER_SIGN
}

export function getNakshatraIndex(longitude: number): number {
  const normalized = normalizeDegree(longitude)
  return Math.floor(normalized / DEGREES_PER_NAKSHATRA) % NAKSHATRAS.length
}

export function getNakshatraFromLongitude(longitude: number): NakshatraInfo {
  const normalized = normalizeDegree(longitude)
  const index = getNakshatraIndex(normalized)
  const positionInNakshatra = normalized % DEGREES_PER_NAKSHATRA
  const pada = Math.min(
    PADAS_PER_NAKSHATRA,
    Math.floor(positionInNakshatra / DEGREES_PER_PADA) + 1
  )

  return {
    name: NAKSHATRAS[index],
    pada,
  }
}

/**
 * Whole-sign house system: house 1 = lagna sign, each subsequent sign is the next house.
 */
export function getHouseNumber(
  planetLongitude: number,
  ascendantLongitude: number
): number {
  const planetSignIndex = getSignIndex(planetLongitude)
  const lagnaSignIndex = getSignIndex(ascendantLongitude)
  return ((planetSignIndex - lagnaSignIndex + HOUSES_COUNT) % HOUSES_COUNT) + 1
}

export function formatPlanetPosition(
  planet: string,
  longitude: number,
  ascendantLongitude: number
): PlanetPosition {
  return {
    planet,
    sign: getSignFromLongitude(longitude),
    degree: roundDegree(getDegreeInSign(longitude)),
    house: getHouseNumber(longitude, ascendantLongitude),
  }
}

export function roundDegree(degree: number, precision = 2): number {
  const factor = 10 ** precision
  return Math.round(degree * factor) / factor
}
