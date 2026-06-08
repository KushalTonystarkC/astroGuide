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
const NORTH_MARGIN = 24

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

/**
 * Sign numbers on the outer edge; planet clusters toward each house interior.
 * Positions tuned to the 400×300 house polygons (counter-clockwise from house 1).
 */
const NORTH_HOUSE_CENTERS: Record<number, [number, number]> = {
  1: [200, 95],
  2: [95, 38],
  3: [48, 78],
  4: [95, 150],
  5: [48, 222],
  6: [92, 268],
  7: [200, 210],
  8: [298, 262],
  9: [348, 218],
  10: [318, 150],
  11: [348, 82],
  12: [305, 38],
}

const NORTH_SIGN_LABEL_POSITIONS: Record<number, [number, number]> = {
  1: [200, 18],
  2: [30, 12],
  3: [12, 75],
  4: [22, 150],
  5: [12, 262],
  6: [55, 288],
  7: [200, 278],
  8: [362, 288],
  9: [382, 228],
  10: [378, 150],
  11: [382, 42],
  12: [362, 12],
}

const PLANET_DISPLAY_ORDER = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const

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
  signNumber: number
  path: string
  labelX: number
  labelY: number
  signLabelX: number
  signLabelY: number
  centerX: number
  centerY: number
  isAscendant: boolean
}

export interface NorthIndianPlanetPlacement {
  planet: PlanetPosition
  x: number
  y: number
  fontSize: number
}

export function getNorthIndianHouses(chart: KundliChart): NorthIndianHouseCell[] {
  const signByHouse = new Map(
    chart.houses.map((house) => [house.house, house.sign])
  )

  return Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1
    const sign = signByHouse.get(houseNumber) ?? chart.lagna
    const [centerX, centerY] = NORTH_HOUSE_CENTERS[houseNumber]
    const [signX, signY] = NORTH_SIGN_LABEL_POSITIONS[houseNumber]
    const center = scaleNorthIndianPoint(centerX, centerY)
    const signLabel = scaleNorthIndianPoint(signX, signY)

    return {
      houseNumber,
      sign,
      abbrev: getSignAbbrev(sign),
      signNumber: getSignIndex(sign) + 1,
      path: polygonToPath(NORTH_HOUSE_POLYGONS[houseNumber]),
      labelX: signLabel.x,
      labelY: signLabel.y,
      signLabelX: signLabel.x,
      signLabelY: signLabel.y,
      centerX: center.x,
      centerY: center.y,
      isAscendant: houseNumber === 1,
    }
  })
}

function sortPlanetsByDisplayOrder(planets: PlanetPosition[]): PlanetPosition[] {
  return [...planets].sort(
    (a, b) =>
      PLANET_DISPLAY_ORDER.indexOf(a.planet as (typeof PLANET_DISPLAY_ORDER)[number]) -
      PLANET_DISPLAY_ORDER.indexOf(b.planet as (typeof PLANET_DISPLAY_ORDER)[number])
  )
}

function layoutPlanetsInHouse(
  planetsInHouse: PlanetPosition[],
  centerX: number,
  centerY: number
): NorthIndianPlanetPlacement[] {
  const count = planetsInHouse.length
  if (count === 0) return []

  const fontSize = count >= 5 ? 9 : count >= 4 ? 10 : 11

  if (count <= 3) {
    const lineHeight = 13
    const startY = centerY - ((count - 1) * lineHeight) / 2
    return planetsInHouse.map((planet, index) => ({
      planet,
      x: centerX,
      y: startY + index * lineHeight,
      fontSize,
    }))
  }

  const cols = 2
  const colGap = count >= 5 ? 26 : 30
  const rowGap = count >= 5 ? 11 : 12
  const rows = Math.ceil(count / cols)
  const totalHeight = (rows - 1) * rowGap
  const startY = centerY - totalHeight / 2

  return planetsInHouse.map((planet, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    const itemsInRow = Math.min(cols, count - row * cols)
    const rowWidth = (itemsInRow - 1) * colGap
    const rowStartX = centerX - rowWidth / 2

    return {
      planet,
      x: rowStartX + col * colGap,
      y: startY + row * rowGap,
      fontSize,
    }
  })
}

export function getNorthIndianPlanetPlacements(
  chart: KundliChart
): NorthIndianPlanetPlacement[] {
  const houses = getNorthIndianHouses(chart)
  const centerByHouse = new Map(
    houses.map((house) => [house.houseNumber, house])
  )
  const byHouse = new Map<number, PlanetPosition[]>()

  for (const planet of chart.planets) {
    const list = byHouse.get(planet.house) ?? []
    list.push(planet)
    byHouse.set(planet.house, list)
  }

  const placements: NorthIndianPlanetPlacement[] = []

  for (const [houseNumber, planetsInHouse] of byHouse) {
    const house = centerByHouse.get(houseNumber)
    if (!house) continue

    placements.push(
      ...layoutPlanetsInHouse(
        sortPlanetsByDisplayOrder(planetsInHouse),
        house.centerX,
        house.centerY
      )
    )
  }

  return placements
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

export function getNorthIndianDiagonalLines(): string {
  const tl = scaleNorthIndianPoint(0, 0)
  const tr = scaleNorthIndianPoint(NORTH_BASE_WIDTH, 0)
  const br = scaleNorthIndianPoint(NORTH_BASE_WIDTH, NORTH_BASE_HEIGHT)
  const bl = scaleNorthIndianPoint(0, NORTH_BASE_HEIGHT)
  const top = scaleNorthIndianPoint(NORTH_BASE_WIDTH / 2, 0)
  const bottom = scaleNorthIndianPoint(NORTH_BASE_WIDTH / 2, NORTH_BASE_HEIGHT)
  const left = scaleNorthIndianPoint(0, NORTH_BASE_HEIGHT / 2)
  const right = scaleNorthIndianPoint(NORTH_BASE_WIDTH, NORTH_BASE_HEIGHT / 2)

  return [
    `M ${tl.x} ${tl.y} L ${br.x} ${br.y}`,
    `M ${tr.x} ${tr.y} L ${bl.x} ${bl.y}`,
    `M ${left.x} ${left.y} L ${top.x} ${top.y}`,
    `M ${top.x} ${top.y} L ${right.x} ${right.y}`,
    `M ${right.x} ${right.y} L ${bottom.x} ${bottom.y}`,
    `M ${bottom.x} ${bottom.y} L ${left.x} ${left.y}`,
  ].join(" ")
}

/** Outer border path for the North Indian chart frame. */
export function getNorthIndianFramePath(): string {
  const tl = scaleNorthIndianPoint(0, 0)
  const tr = scaleNorthIndianPoint(NORTH_BASE_WIDTH, 0)
  const br = scaleNorthIndianPoint(NORTH_BASE_WIDTH, NORTH_BASE_HEIGHT)
  const bl = scaleNorthIndianPoint(0, NORTH_BASE_HEIGHT)
  return `M ${tl.x} ${tl.y} L ${tr.x} ${tr.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`
}
