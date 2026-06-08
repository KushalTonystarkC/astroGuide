import planetsData from "@/data/planets.json"
import { RASHIS } from "@/data/zodiac-signs"
import { getRashiAbbreviation, getRashiIndex } from "@/lib/astrology/zodiac"
import type { KundliChart, PlanetPosition } from "@/lib/astrology/types"

const planets = planetsData as Record<string, { symbol: string }>

export function getSignIndex(sign: string): number {
  return getRashiIndex(sign)
}

export function getSignAbbrev(sign: string): string {
  return getRashiAbbreviation(sign)
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
  chart: KundliChart,
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
    const baseAngle = signToAngle(sign, chart.lagna)
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
        name: planet.planet,
        symbol: getPlanetSymbol(planet.planet),
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
  return RASHIS.map((sign, zodiacIndex) => {
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

/** North Indian chart geometry (400×300 base, scaled to fit viewBox). */
const NORTH_BASE_WIDTH = 400
const NORTH_BASE_HEIGHT = 300
const NORTH_VIEW_SIZE = 400
const NORTH_MARGIN = 20

/** Polygons keyed by house number (1 = top-center Lagna, counter-clockwise). */
const NORTH_HOUSE_POLYGONS: Record<number, [number, number][]> = {
  1: [
    [100, 75],
    [200, 150],
    [300, 75],
    [200, 0],
  ],
  2: [
    [0, 0],
    [100, 75],
    [200, 0],
  ],
  3: [
    [0, 0],
    [0, 150],
    [100, 75],
  ],
  4: [
    [0, 150],
    [100, 225],
    [200, 150],
    [100, 75],
  ],
  5: [
    [0, 150],
    [0, 300],
    [100, 225],
  ],
  6: [
    [100, 225],
    [0, 300],
    [200, 300],
  ],
  7: [
    [100, 225],
    [200, 300],
    [300, 225],
    [200, 150],
  ],
  8: [
    [300, 225],
    [200, 300],
    [400, 300],
  ],
  9: [
    [300, 225],
    [400, 300],
    [400, 150],
  ],
  10: [
    [300, 75],
    [200, 150],
    [300, 225],
    [400, 150],
  ],
  11: [
    [300, 75],
    [400, 150],
    [400, 0],
  ],
  12: [
    [200, 0],
    [300, 75],
    [400, 0],
  ],
}

const NORTH_HOUSE_CENTERS: Record<number, [number, number]> = {
  1: [190, 75],
  2: [100, 30],
  3: [30, 75],
  4: [90, 150],
  5: [30, 225],
  6: [90, 278],
  7: [190, 225],
  8: [290, 278],
  9: [360, 225],
  10: [290, 150],
  11: [360, 75],
  12: [290, 30],
}

function scaleNorthIndianPoint(x: number, y: number): { x: number; y: number } {
  const inner = NORTH_VIEW_SIZE - NORTH_MARGIN * 2
  return {
    x: NORTH_MARGIN + (x / NORTH_BASE_WIDTH) * inner,
    y: NORTH_MARGIN + (y / NORTH_BASE_HEIGHT) * inner,
  }
}

function polygonToPath(points: [number, number][]): string {
  const scaled = points.map(([x, y]) => scaleNorthIndianPoint(x, y))
  const [first, ...rest] = scaled
  return [
    `M ${first.x} ${first.y}`,
    ...rest.map((p) => `L ${p.x} ${p.y}`),
    "Z",
  ].join(" ")
}

export interface NorthIndianHouseCell {
  houseNumber: number
  sign: string
  abbrev: string
  path: string
  labelX: number
  labelY: number
  centerX: number
  centerY: number
  isAscendant: boolean
}

export function getNorthIndianHouses(chart: KundliChart): NorthIndianHouseCell[] {
  const signByHouse = new Map(
    chart.houses.map((house) => [house.house, house.sign])
  )

  return Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1
    const sign = signByHouse.get(houseNumber) ?? chart.lagna
    const center = scaleNorthIndianPoint(
      ...NORTH_HOUSE_CENTERS[houseNumber]
    )
    const label = scaleNorthIndianPoint(
      NORTH_HOUSE_CENTERS[houseNumber][0],
      NORTH_HOUSE_CENTERS[houseNumber][1] + 18
    )

    return {
      houseNumber,
      sign,
      abbrev: getSignAbbrev(sign),
      path: polygonToPath(NORTH_HOUSE_POLYGONS[houseNumber]),
      labelX: label.x,
      labelY: label.y,
      centerX: center.x,
      centerY: center.y,
      isAscendant: houseNumber === 1,
    }
  })
}

export function layoutPlanetsInNorthIndian(chart: KundliChart): PlacedPlanet[] {
  const houses = getNorthIndianHouses(chart)
  const centerByHouse = new Map(
    houses.map((house) => [
      house.houseNumber,
      { x: house.centerX, y: house.centerY },
    ])
  )
  const byHouse = new Map<number, PlanetPosition[]>()

  for (const planet of chart.planets) {
    const list = byHouse.get(planet.house) ?? []
    list.push(planet)
    byHouse.set(planet.house, list)
  }

  const placed: PlacedPlanet[] = []

  for (const [houseNumber, planetsInHouse] of byHouse) {
    const center = centerByHouse.get(houseNumber)
    if (!center) continue

    planetsInHouse.forEach((planet, index) => {
      const count = planetsInHouse.length
      const xOffset = count > 1 ? (index - (count - 1) / 2) * 24 : 0
      const yOffset =
        count > 2 ? (Math.floor(index / 2) - (Math.ceil(count / 2) - 1) / 2) * 20 : 0

      placed.push({
        name: planet.planet,
        symbol: getPlanetSymbol(planet.planet),
        sign: planet.sign,
        x: center.x + xOffset,
        y: center.y + yOffset,
      })
    })
  }

  return placed
}

/** Outer border path for the North Indian chart frame. */
export function getNorthIndianFramePath(): string {
  const tl = scaleNorthIndianPoint(0, 0)
  const tr = scaleNorthIndianPoint(NORTH_BASE_WIDTH, 0)
  const br = scaleNorthIndianPoint(NORTH_BASE_WIDTH, NORTH_BASE_HEIGHT)
  const bl = scaleNorthIndianPoint(0, NORTH_BASE_HEIGHT)
  return `M ${tl.x} ${tl.y} L ${tr.x} ${tr.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`
}
