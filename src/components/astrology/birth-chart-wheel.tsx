"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getPlanetSymbol,
  getWheelSegments,
  layoutPlanetsOnWheel,
  polarToCartesian,
} from "@/lib/chart-layout"
import type { AstrologyChart } from "@/types/astrology"

interface BirthChartWheelProps {
  chart: AstrologyChart
  className?: string
}

const CX = 200
const CY = 200
const OUTER_R = 188
const INNER_R = 118
const SIGN_LABEL_R = 158
const PLANET_R = 138

function describeArc(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const endInner = polarToCartesian(cx, cy, innerR, endAngle)
  const startInner = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
    "Z",
  ].join(" ")
}

export function BirthChartWheel({ chart, className }: BirthChartWheelProps) {
  const segments = getWheelSegments(chart.ascendant)
  const planets = layoutPlanetsOnWheel(chart, CX, CY, PLANET_R)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Birth Chart Wheel</CardTitle>
        <CardDescription>
          Whole-sign chart with Lagna ({chart.ascendant}) at the 9 o&apos;clock
          position · Mock placements for preview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mx-auto flex max-w-md justify-center">
          <svg
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Vedic birth chart wheel with ascendant in ${chart.ascendant}`}
            className="h-auto w-full max-w-[400px] drop-shadow-sm"
          >
            <defs>
              <radialGradient id="chart-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="oklch(0.55 0.15 280 / 0.12)" />
                <stop offset="100%" stopColor="oklch(0.55 0.15 280 / 0.02)" />
              </radialGradient>
              <linearGradient
                id="ascendant-glow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="oklch(0.55 0.2 280 / 0.35)" />
                <stop offset="100%" stopColor="oklch(0.55 0.2 280 / 0.08)" />
              </linearGradient>
            </defs>

            <circle
              cx={CX}
              cy={CY}
              r={OUTER_R}
              fill="url(#chart-bg)"
              className="stroke-border"
              strokeWidth={1.5}
            />

            {segments.map((segment) => {
              const midAngle = segment.startAngle + 15
              const labelPos = polarToCartesian(CX, CY, SIGN_LABEL_R, midAngle)
              const housePos = polarToCartesian(CX, CY, INNER_R + 14, midAngle)

              return (
                <g key={segment.sign}>
                  <path
                    d={describeArc(
                      CX,
                      CY,
                      INNER_R,
                      OUTER_R,
                      segment.startAngle,
                      segment.endAngle
                    )}
                    fill={
                      segment.isAscendant
                        ? "url(#ascendant-glow)"
                        : segment.houseNumber % 2 === 0
                          ? "oklch(0.55 0.08 280 / 0.06)"
                          : "transparent"
                    }
                    className={
                      segment.isAscendant
                        ? "stroke-primary"
                        : "stroke-border/50"
                    }
                    strokeWidth={segment.isAscendant ? 2 : 0.5}
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-[11px] font-semibold"
                  >
                    {segment.abbrev}
                  </text>
                  <text
                    x={housePos.x}
                    y={housePos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[9px]"
                  >
                    {segment.isAscendant ? "ASC" : segment.houseNumber}
                  </text>
                </g>
              )
            })}

            {[INNER_R, PLANET_R - 8, OUTER_R].map((r) => (
              <circle
                key={r}
                cx={CX}
                cy={CY}
                r={r}
                fill="none"
                className="stroke-border/40"
                strokeWidth={0.75}
                strokeDasharray={r === PLANET_R - 8 ? "4 4" : undefined}
              />
            ))}

            {planets.map((planet) => (
              <g key={planet.name}>
                <circle
                  cx={planet.x}
                  cy={planet.y}
                  r={14}
                  className="fill-card stroke-primary/40"
                  strokeWidth={1.5}
                />
                <text
                  x={planet.x}
                  y={planet.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-primary text-[13px] font-medium"
                >
                  {planet.symbol}
                </text>
              </g>
            ))}

            <circle
              cx={CX}
              cy={CY}
              r={52}
              className="fill-card stroke-border"
              strokeWidth={1.5}
            />
            <text
              x={CX}
              y={CY - 10}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-medium uppercase tracking-wider"
            >
              Lagna
            </text>
            <text
              x={CX}
              y={CY + 12}
              textAnchor="middle"
              className="fill-foreground text-[15px] font-bold"
            >
              {chart.ascendant}
            </text>

            <line
              x1={CX - OUTER_R + 4}
              y1={CY}
              x2={CX - INNER_R + 4}
              y2={CY}
              className="stroke-primary"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <polygon
              points={`${CX - OUTER_R - 2},${CY} ${CX - OUTER_R + 10},${CY - 6} ${CX - OUTER_R + 10},${CY + 6}`}
              className="fill-primary"
            />
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          {chart.planets.map((planet) => (
            <span
              key={planet.name}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1"
            >
              <span className="text-primary">{getPlanetSymbol(planet.name)}</span>
              <span className="font-medium text-foreground">{planet.name}</span>
              <span>in {planet.sign}</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
