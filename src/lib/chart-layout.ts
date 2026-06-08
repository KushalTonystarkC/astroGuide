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

const PLANET_ABBREVS: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Venus: "Ve",
  Jupiter: "Ju",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
}

export function getPlanetAbbrev(name: string): string {
  return PLANET_ABBREVS[name] ?? name.slice(0, 2)
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
  abbrev: string
  sign: string
  x: number
  y: number
  fontSize: number
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
        abbrev: getPlanetAbbrev(planet.planet),
        sign: planet.sign,
        x,
        y,
        fontSize: 10,
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

const NORTH_CHART_CENTER: [number, number] = [200, 150]

/** Sign label anchors in base coords — kept away from outer edges. */
const NORTH_HOUSE_LABEL_ANCHORS: Record<number, [number, number]> = {
  1: [200, 36],
  2: [100, 24],
  3: [24, 75],
  4: [58, 150],
  5: [42, 242],
  6: [100, 252],
  7: [200, 242],
  8: [300, 252],
  9: [358, 242],
  10: [300, 150],
  11: [358, 68],
  12: [300, 24],
}

/** Planet anchors in base coords — tuned per house to avoid bleeding into neighbors. */
const NORTH_HOUSE_PLANET_ANCHORS: Record<number, [number, number]> = {
  1: [200, 56],
  2: [100, 44],
  3: [44, 75],
  4: [78, 150],
  5: [56, 222],
  6: [108, 232],
  7: [200, 218],
  8: [318, 258],
  9: [352, 222],
  10: [300, 132],
  11: [352, 58],
  12: [300, 44],
}

const NORTH_PLANET_INSET = 0.42
const NORTH_LABEL_INSET = 0.38
const NORTH_LABEL_PLANET_GAP = 28

/** Triangular houses — vertical planet stacks read best here. */
const NORTH_NARROW_HOUSES = new Set([2, 3, 5, 6, 8, 9, 11, 12])

function scaleNorthIndianPoint(x: number, y: number): { x: number; y: number } {
  const inner = NORTH_VIEW_SIZE - NORTH_MARGIN * 2
  return {
    x: NORTH_MARGIN + (x / NORTH_BASE_WIDTH) * inner,
    y: NORTH_MARGIN + (y / NORTH_BASE_HEIGHT) * inner,
  }
}

type Point = { x: number; y: number }

function getScaledHousePolygon(houseNumber: number): Point[] {
  return NORTH_HOUSE_POLYGONS[houseNumber].map(([x, y]) =>
    scaleNorthIndianPoint(x, y)
  )
}

function polygonCentroid(points: Point[]): Point {
  let area = 0
  let cx = 0
  let cy = 0

  for (let i = 0; i < points.length; i++) {
    const current = points[i]
    const next = points[(i + 1) % points.length]
    const cross = current.x * next.y - next.x * current.y
    area += cross
    cx += (current.x + next.x) * cross
    cy += (current.y + next.y) * cross
  }

  area *= 0.5
  if (Math.abs(area) < 1e-6) {
    const avg = points.reduce(
      (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
      { x: 0, y: 0 }
    )
    return { x: avg.x / points.length, y: avg.y / points.length }
  }

  return { x: cx / (6 * area), y: cy / (6 * area) }
}

function insetToward(point: Point, target: Point, factor: number): Point {
  return {
    x: point.x + (target.x - point.x) * factor,
    y: point.y + (target.y - point.y) * factor,
  }
}

function minDistanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSq = dx * dx + dy * dy

  if (lengthSq === 0) {
    return Math.hypot(px - x1, py - y1)
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq))
  const projX = x1 + t * dx
  const projY = y1 + t * dy
  return Math.hypot(px - projX, py - projY)
}

function minDistanceToPolygon(px: number, py: number, polygon: Point[]): number {
  let min = Infinity

  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i]
    const next = polygon[(i + 1) % polygon.length]
    min = Math.min(
      min,
      minDistanceToSegment(px, py, current.x, current.y, next.x, next.y)
    )
  }

  return min
}

function isPointInsidePolygon(px: number, py: number, polygon: Point[]): boolean {
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi

    if (intersects) inside = !inside
  }

  return inside
}

function isSafePlacement(
  px: number,
  py: number,
  polygon: Point[],
  margin: number
): boolean {
  return (
    isPointInsidePolygon(px, py, polygon) &&
    minDistanceToPolygon(px, py, polygon) >= margin
  )
}

function getHouseInteriorAnchor(houseNumber: number, inset = NORTH_PLANET_INSET): Point {
  const polygon = getScaledHousePolygon(houseNumber)
  const centroid = polygonCentroid(polygon)
  const chartCenter = scaleNorthIndianPoint(...NORTH_CHART_CENTER)
  return insetToward(centroid, chartCenter, inset)
}

function getHousePlanetAnchor(houseNumber: number): Point {
  const polygon = getScaledHousePolygon(houseNumber)
  const preset = scaleNorthIndianPoint(
    ...NORTH_HOUSE_PLANET_ANCHORS[houseNumber]
  )

  if (isPointInsidePolygon(preset.x, preset.y, polygon)) {
    return preset
  }

  const centroid = polygonCentroid(polygon)
  const label = scaleNorthIndianPoint(...NORTH_HOUSE_LABEL_ANCHORS[houseNumber])
  const dx = centroid.x - label.x
  const dy = centroid.y - label.y
  const length = Math.hypot(dx, dy)

  if (length > 0) {
    const offset = {
      x: label.x + (dx / length) * NORTH_LABEL_PLANET_GAP,
      y: label.y + (dy / length) * NORTH_LABEL_PLANET_GAP,
    }

    if (isPointInsidePolygon(offset.x, offset.y, polygon)) {
      return offset
    }
  }

  return centroid
}

export type NorthIndianPlanetLayout = "single" | "row" | "column" | "grid"

export interface NorthIndianPlanetGroup {
  houseNumber: number
  layout: NorthIndianPlanetLayout
  centerX: number
  centerY: number
  fontSize: number
  lineHeight: number
  columnSpacing: number
  cols: number
  rows: number
  planets: Array<{
    name: string
    abbrev: string
    symbol: string
    sign: string
  }>
}

function getPlanetTypography(count: number): {
  fontSize: number
  lineHeight: number
  columnSpacing: number
} {
  if (count >= 5) {
    return { fontSize: 11, lineHeight: 22, columnSpacing: 24 }
  }
  if (count >= 3) {
    return { fontSize: 11, lineHeight: 20, columnSpacing: 24 }
  }
  return { fontSize: 12, lineHeight: 22, columnSpacing: 26 }
}

function choosePlanetLayout(
  count: number,
  houseNumber: number
): NorthIndianPlanetLayout {
  if (count === 1) return "single"
  if (count >= 4) return "grid"
  if (count === 2) {
    return NORTH_NARROW_HOUSES.has(houseNumber) ? "column" : "row"
  }
  if (count === 3 && NORTH_NARROW_HOUSES.has(houseNumber)) return "column"
  return "grid"
}

function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function getGridShape(count: number): { cols: number; rows: number } {
  if (count <= 2) return { cols: count, rows: 1 }
  if (count === 3) return { cols: 3, rows: 1 }
  if (count === 4) return { cols: 2, rows: 2 }
  if (count === 5) return { cols: 3, rows: 2 }
  if (count === 6) return { cols: 3, rows: 2 }
  return { cols: 3, rows: Math.ceil(count / 3) }
}

function stackFitsInPolygon(
  anchor: Point,
  count: number,
  lineHeight: number,
  polygon: Point[],
  margin: number
): boolean {
  const totalHeight = (count - 1) * lineHeight
  const startY = anchor.y - totalHeight / 2

  return Array.from({ length: count }, (_, index) => index).every((index) =>
    isSafePlacement(anchor.x, startY + index * lineHeight, polygon, margin)
  )
}

function rowFitsInPolygon(
  anchor: Point,
  count: number,
  spacing: number,
  polygon: Point[],
  margin: number
): boolean {
  const totalWidth = (count - 1) * spacing
  const startX = anchor.x - totalWidth / 2

  return Array.from({ length: count }, (_, index) => index).every((index) =>
    isSafePlacement(startX + index * spacing, anchor.y, polygon, margin)
  )
}

function gridFitsInPolygon(
  anchor: Point,
  count: number,
  cols: number,
  spacingX: number,
  spacingY: number,
  polygon: Point[],
  margin: number
): boolean {
  const rows = Math.ceil(count / cols)
  const totalWidth = (cols - 1) * spacingX
  const totalHeight = (rows - 1) * spacingY

  return Array.from({ length: count }, (_, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    return isSafePlacement(
      anchor.x - totalWidth / 2 + col * spacingX,
      anchor.y - totalHeight / 2 + row * spacingY,
      polygon,
      margin
    )
  }).every(Boolean)
}

function layoutFitsInPolygon(
  candidate: Point,
  count: number,
  layout: NorthIndianPlanetLayout,
  typography: ReturnType<typeof getPlanetTypography>,
  polygon: Point[],
  margin: number
): boolean {
  if (!isPointInsidePolygon(candidate.x, candidate.y, polygon)) return false

  if (layout === "single") {
    return isSafePlacement(candidate.x, candidate.y, polygon, margin)
  }
  if (layout === "column") {
    return stackFitsInPolygon(
      candidate,
      count,
      typography.lineHeight,
      polygon,
      margin
    )
  }
  if (layout === "row") {
    return rowFitsInPolygon(
      candidate,
      count,
      typography.columnSpacing,
      polygon,
      margin
    )
  }

  const { cols } = getGridShape(count)
  return gridFitsInPolygon(
    candidate,
    count,
    cols,
    typography.columnSpacing,
    typography.lineHeight,
    polygon,
    margin
  )
}

function findBestPlanetAnchor(
  houseNumber: number,
  count: number,
  layout: NorthIndianPlanetLayout,
  typography: ReturnType<typeof getPlanetTypography>
): Point {
  const polygon = getScaledHousePolygon(houseNumber)
  const preferred = getHousePlanetAnchor(houseNumber)
  const centroid = polygonCentroid(polygon)
  const margin = typography.fontSize / 2 + 3
  const { cols } = getGridShape(count)

  const candidates: Point[] = [preferred, centroid]
  const label = scaleNorthIndianPoint(...NORTH_HOUSE_LABEL_ANCHORS[houseNumber])
  const towardCentroid = {
    x: centroid.x - label.x,
    y: centroid.y - label.y,
  }
  const towardLength = Math.hypot(towardCentroid.x, towardCentroid.y)

  if (towardLength > 0) {
    const unitX = towardCentroid.x / towardLength
    const unitY = towardCentroid.y / towardLength

    for (let step = -16; step <= 20; step += 4) {
      candidates.push({
        x: preferred.x + unitX * step,
        y: preferred.y + unitY * step,
      })
      candidates.push({
        x: centroid.x + unitX * step,
        y: centroid.y + unitY * step,
      })
    }
  }

  const xs = polygon.map((point) => point.x)
  const ys = polygon.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  for (let y = minY + margin; y <= maxY - margin; y += 4) {
    for (let x = minX + margin; x <= maxX - margin; x += 4) {
      candidates.push({ x, y })
    }
  }

  let best: Point | null = null
  let bestScore = -1

  for (const candidate of candidates) {
    if (
      !layoutFitsInPolygon(
        candidate,
        count,
        layout,
        typography,
        polygon,
        margin
      )
    ) {
      continue
    }

    const centroidDistance = distanceBetween(candidate, centroid)
    const preferredDistance = distanceBetween(candidate, preferred)
    const score = centroidDistance * 0.35 + preferredDistance * -0.15

    if (layout !== "single") {
      const positions =
        layout === "column"
          ? Array.from({ length: count }, (_, index) => {
              const totalHeight = (count - 1) * typography.lineHeight
              const startY = candidate.y - totalHeight / 2
              return { x: candidate.x, y: startY + index * typography.lineHeight }
            })
          : layout === "row"
            ? Array.from({ length: count }, (_, index) => {
                const totalWidth = (count - 1) * typography.columnSpacing
                const startX = candidate.x - totalWidth / 2
                return {
                  x: startX + index * typography.columnSpacing,
                  y: candidate.y,
                }
              })
            : Array.from({ length: count }, (_, index) => {
                const col = index % cols
                const row = Math.floor(index / cols)
                const totalWidth = (cols - 1) * typography.columnSpacing
                const totalHeight =
                  (Math.ceil(count / cols) - 1) * typography.lineHeight
                return {
                  x:
                    candidate.x -
                    totalWidth / 2 +
                    col * typography.columnSpacing,
                  y:
                    candidate.y -
                    totalHeight / 2 +
                    row * typography.lineHeight,
                }
              })

      const minEdge = Math.min(
        ...positions.map((point) => minDistanceToPolygon(point.x, point.y, polygon))
      )
      if (minEdge > bestScore) {
        bestScore = minEdge
        best = candidate
      }
      continue
    }

    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }

  return best ?? preferred
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
    const labelAnchor = scaleNorthIndianPoint(
      ...NORTH_HOUSE_LABEL_ANCHORS[houseNumber]
    )
    const interiorAnchor = getHouseInteriorAnchor(houseNumber, NORTH_LABEL_INSET)

    return {
      houseNumber,
      sign,
      abbrev: getSignAbbrev(sign),
      path: polygonToPath(NORTH_HOUSE_POLYGONS[houseNumber]),
      labelX: labelAnchor.x,
      labelY: labelAnchor.y,
      centerX: interiorAnchor.x,
      centerY: interiorAnchor.y,
      isAscendant: houseNumber === 1,
    }
  })
}

export function layoutNorthIndianPlanetGroups(
  chart: KundliChart
): NorthIndianPlanetGroup[] {
  const byHouse = new Map<number, PlanetPosition[]>()

  for (const planet of chart.planets) {
    const list = byHouse.get(planet.house) ?? []
    list.push(planet)
    byHouse.set(planet.house, list)
  }

  const groups: NorthIndianPlanetGroup[] = []

  for (const [houseNumber, planetsInHouse] of byHouse) {
    const count = planetsInHouse.length
    const layout = choosePlanetLayout(count, houseNumber)
    const typography = getPlanetTypography(count)
    const anchor = findBestPlanetAnchor(
      houseNumber,
      count,
      layout,
      typography
    )
    const { cols, rows } = getGridShape(count)

    groups.push({
      houseNumber,
      layout,
      centerX: anchor.x,
      centerY: anchor.y,
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      columnSpacing: typography.columnSpacing,
      cols,
      rows,
      planets: planetsInHouse.map((planet) => ({
        name: planet.planet,
        abbrev: getPlanetAbbrev(planet.planet),
        symbol: getPlanetSymbol(planet.planet),
        sign: planet.sign,
      })),
    })
  }

  return groups
}

/** @deprecated Use layoutNorthIndianPlanetGroups for chart rendering. */
export function layoutPlanetsInNorthIndian(chart: KundliChart): PlacedPlanet[] {
  return layoutNorthIndianPlanetGroups(chart).flatMap((group) =>
    group.planets.map((planet, index) => {
      let x = group.centerX
      let y = group.centerY

      if (group.layout === "column") {
        const totalHeight = (group.planets.length - 1) * group.lineHeight
        y = group.centerY - totalHeight / 2 + index * group.lineHeight
      } else if (group.layout === "row") {
        const totalWidth = (group.planets.length - 1) * group.columnSpacing
        x = group.centerX - totalWidth / 2 + index * group.columnSpacing
      } else if (group.layout === "grid") {
        const col = index % group.cols
        const row = Math.floor(index / group.cols)
        const totalWidth = (group.cols - 1) * group.columnSpacing
        const totalHeight = (group.rows - 1) * group.lineHeight
        x = group.centerX - totalWidth / 2 + col * group.columnSpacing
        y = group.centerY - totalHeight / 2 + row * group.lineHeight
      }

      return {
        name: planet.name,
        symbol: planet.symbol,
        abbrev: planet.abbrev,
        sign: planet.sign,
        x,
        y,
        fontSize: group.fontSize,
      }
    })
  )
}

/** Outer border path for the North Indian chart frame. */
export function getNorthIndianFramePath(): string {
  const tl = scaleNorthIndianPoint(0, 0)
  const tr = scaleNorthIndianPoint(NORTH_BASE_WIDTH, 0)
  const br = scaleNorthIndianPoint(NORTH_BASE_WIDTH, NORTH_BASE_HEIGHT)
  const bl = scaleNorthIndianPoint(0, NORTH_BASE_HEIGHT)
  return `M ${tl.x} ${tl.y} L ${tr.x} ${tr.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`
}
