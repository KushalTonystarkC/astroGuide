"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getNorthIndianFramePath,
  getNorthIndianHouses,
  getPlanetSymbol,
  layoutPlanetsInNorthIndian,
} from "@/lib/chart-layout"
import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import type { KundliChart } from "@/lib/astrology/types"

interface BirthChartNorthIndianProps {
  chart: KundliChart
  className?: string
}

export function BirthChartNorthIndian({
  chart,
  className,
}: BirthChartNorthIndianProps) {
  const houses = getNorthIndianHouses(chart)
  const planets = layoutPlanetsInNorthIndian(chart)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>North Indian Birth Chart</CardTitle>
        <CardDescription>
          Fixed-house chart with Lagna ({chart.lagna} /{" "}
          {getRashiEnglishName(chart.lagna)}) in the top center · read
          counter-clockwise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mx-auto flex max-w-md justify-center">
          <svg
            viewBox="0 0 400 400"
            role="img"
            aria-label={`North Indian Vedic birth chart with ascendant in ${chart.lagna}`}
            className="h-auto w-full max-w-[400px] drop-shadow-sm"
          >
            <defs>
              <linearGradient
                id="north-ascendant-glow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="oklch(0.55 0.2 280 / 0.35)" />
                <stop offset="100%" stopColor="oklch(0.55 0.2 280 / 0.08)" />
              </linearGradient>
            </defs>

            <rect
              x={0}
              y={0}
              width={400}
              height={400}
              fill="oklch(0.55 0.15 280 / 0.04)"
              rx={4}
            />

            {houses.map((house) => (
              <path
                key={house.houseNumber}
                d={house.path}
                fill={
                  house.isAscendant
                    ? "url(#north-ascendant-glow)"
                    : house.houseNumber % 2 === 0
                      ? "oklch(0.55 0.08 280 / 0.05)"
                      : "transparent"
                }
                className={
                  house.isAscendant ? "stroke-primary" : "stroke-border/60"
                }
                strokeWidth={house.isAscendant ? 2 : 1}
              />
            ))}

            <path
              d={getNorthIndianFramePath()}
              fill="none"
              className="stroke-border"
              strokeWidth={2}
            />

            {houses.map((house) => (
              <g key={`label-${house.houseNumber}`}>
                <text
                  x={house.labelX}
                  y={house.labelY - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[8px] font-medium uppercase tracking-wide"
                >
                  {house.isAscendant ? "Lagna" : `H${house.houseNumber}`}
                </text>
                <text
                  x={house.labelX}
                  y={house.labelY + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={
                    house.isAscendant
                      ? "fill-primary text-[13px] font-bold"
                      : "fill-foreground text-[12px] font-semibold"
                  }
                >
                  {house.abbrev}
                </text>
              </g>
            ))}

            {planets.map((planet) => (
              <g key={planet.name}>
                <circle
                  cx={planet.x}
                  cy={planet.y}
                  r={13}
                  className="fill-card stroke-primary/40"
                  strokeWidth={1.5}
                />
                <text
                  x={planet.x}
                  y={planet.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-primary text-[12px] font-medium"
                >
                  {planet.symbol}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          {chart.planets.map((planet) => (
            <span
              key={planet.planet}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1"
            >
              <span className="text-primary">
                {getPlanetSymbol(planet.planet)}
              </span>
              <span className="font-medium text-foreground">{planet.planet}</span>
              <span>
                in {planet.sign} · H{planet.house}
              </span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
