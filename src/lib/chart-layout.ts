import planetsData from "@/data/planets.json"
import { ZODIAC_SIGNS } from "@/lib/constants"
import type { AstrologyChart, PlanetPosition } from "@/types/astrology"

const SIGN_ABBREV: Record<string, string> = {
  Aries: "Ari",
  Taurus: "Tau",
  Gemini: "Gem",
  Cancer: "Can",
  Leo: "Leo",
  Virgo: "Vir",
  Libra: "Lib",
  Scorpio: "Sco",
  Sagittarius: "Sag",
  Capricorn: "Cap",
  Aquarius: "Aqu",
  Pisces: "Pis",
}

const planets = planetsData as Record<string, { symbol: string }>

export function getSignIndex(sign: string): number {
  const index = ZODIAC_SIGNS.indexOf(sign as (typeof ZODIAC_SIGNS)[number])
  return index >= 0 ? index : 0
}

export function getSignAbbrev(sign: string): string {
  return SIGN_ABBREV[sign] ?? sign.slice(0, 3)
}

export function getPlanetSymbol(name: string): string {
  return planets[name]?.symbol ?? name.charAt(0)
}

/** Lagna at 9 o'clock; segments advance counter-clockwise. */
export function signToAngle(sign: string, ascendantSign: string): number {
  const signIndex = getSignIndex(sign)
  const ascIndex = getSignIndex(ascendantSign)
  const houseOffset = (signIndex - ascIndex + 12) % 12
  return -90 + houseOffset * 30 + 15
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

export interface PlacedPlanet {
  name: string
  symbol: string
  sign: string
  x: number
  y: number
  isAscendantMarker?: boolean
}

export function layoutPlanetsOnWheel(
  chart: AstrologyChart,
  cx: number,
  cy: number,
  planetRadius: number
): PlacedPlanet[] {
  const bySign = new Map<string, PlanetPosition[]>()

  for (const planet of chart.planets) {
    const list = bySign.get(planet.sign) ?? []
    list.push(planet)
    bySign.set(planet.sign, list)
  }

  const placed: PlacedPlanet[] = []

  for (const [sign, planetsInSign] of bySign) {
    const baseAngle = signToAngle(sign, chart.ascendant)
    planetsInSign.forEach((planet, index) => {
      const spread =
        planetsInSign.length > 1
          ? (index - (planetsInSign.length - 1) / 2) * 7
          : 0
      const { x, y } = polarToCartesian(
        cx,
        cy,
        planetRadius,
        baseAngle + spread
      )
      placed.push({
        name: planet.name,
        symbol: getPlanetSymbol(planet.name),
        sign: planet.sign,
        x,
        y,
      })
    })
  }

  return placed
}

export function getWheelSegments(ascendantSign: string) {
  const ascIndex = getSignIndex(ascendantSign)
  return ZODIAC_SIGNS.map((sign, zodiacIndex) => {
    const houseOffset = (zodiacIndex - ascIndex + 12) % 12
    return {
      sign,
      abbrev: getSignAbbrev(sign),
      houseNumber: houseOffset + 1,
      startAngle: -90 + houseOffset * 30,
      endAngle: -90 + (houseOffset + 1) * 30,
      isAscendant: houseOffset === 0,
    }
  })
}
