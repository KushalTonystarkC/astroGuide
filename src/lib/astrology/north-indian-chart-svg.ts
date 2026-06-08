/**
 * North Indian chart SVG renderer using shared polygon geometry from chart-layout.
 */

import {
  getNorthIndianDiagonalLines,
  getNorthIndianFramePath,
  getNorthIndianHouses,
  getNorthIndianPlanetPlacements,
} from "@/lib/chart-layout"
import { getPlanetAbbreviation } from "@/lib/astrology/kundli-display"
import type { KundliChart } from "@/lib/astrology/types"

const CHART_COLORS = {
  background: "var(--card, #FFFFFF)",
  border: "var(--primary, #422762)",
  innerLines: "var(--primary, #422762)",
  signNumber: "var(--primary, #422762)",
  planet: "var(--foreground, #333333)",
  retrograde: "var(--destructive, #D63031)",
  degree: "var(--muted-foreground, #5A5A7A)",
}

const FONT_FAMILY = "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif"
const VIEW_SIZE = 400

export interface NorthIndianChartSvgOptions {
  width?: number
  height?: number
}

export function generateNorthIndianChartSvg(
  chart: KundliChart,
  _options?: NorthIndianChartSvgOptions
): string {
  const houses = getNorthIndianHouses(chart)
  const planetPlacements = getNorthIndianPlanetPlacements(chart)
  const framePath = getNorthIndianFramePath()
  const diagonalLines = getNorthIndianDiagonalLines()

  const frame = `
    <rect x="0" y="0" width="${VIEW_SIZE}" height="${VIEW_SIZE}" fill="${CHART_COLORS.background}" rx="8" />
    <path d="${framePath}" fill="${CHART_COLORS.background}" stroke="${CHART_COLORS.border}" stroke-width="2.5" />
    <path d="${diagonalLines}" fill="none" stroke="${CHART_COLORS.innerLines}" stroke-width="1.5" />
  `

  const signLabels = houses
    .map(
      (house) =>
        `<text x="${house.signLabelX}" y="${house.signLabelY}"
               font-family="${FONT_FAMILY}" font-size="12" font-weight="700"
               fill="${CHART_COLORS.signNumber}"
               text-anchor="middle" dominant-baseline="middle">${house.signNumber}</text>`
    )
    .join("")

  const planets = planetPlacements
    .map(({ planet, x, y, fontSize }) => {
      const abbr = getPlanetAbbreviation(planet.planet)
      const isRetrograde = planet.isRetrograde ?? false
      const label = isRetrograde ? `${abbr} R` : abbr
      const color = isRetrograde ? CHART_COLORS.retrograde : CHART_COLORS.planet
      const deg = Math.round(planet.degree)
      const degreeSize = fontSize <= 9 ? 7 : 8

      return `<text x="${x}" y="${y}"
                     font-family="${FONT_FAMILY}" font-size="${fontSize}" font-weight="700"
                     fill="${color}"
                     text-anchor="middle" dominant-baseline="middle">${label}<tspan dx="1" dy="-4" font-size="${degreeSize}" fill="${CHART_COLORS.degree}">${deg}</tspan></text>`
    })
    .join("")

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_SIZE} ${VIEW_SIZE}" class="kundli-chart-svg" role="img" aria-label="North Indian birth chart">${frame}${signLabels}${planets}</svg>`
}
