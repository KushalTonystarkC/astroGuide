"use client"

import { useCallback, useMemo, useState } from "react"
import { Sparkles, X } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import planetsData from "@/data/planets.json"
import {
  getNorthIndianFramePath,
  getNorthIndianHouses,
  getPlanetSymbol,
  layoutNorthIndianPlanetGroups,
  type NorthIndianPlanetGroup,
} from "@/lib/chart-layout"
import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import { cn } from "@/lib/utils"
import type { KundliChart, PlanetPosition } from "@/lib/astrology/types"

interface BirthChartNorthIndianProps {
  chart: KundliChart
  className?: string
}

type ChartSelection =
  | { type: "house"; houseNumber: number }
  | { type: "planet"; planetName: string }
  | null

const PLANET_META = planetsData as Record<
  string,
  { name: string; symbol: string; nature: string; significance: string }
>

const HOUSE_THEMES: Record<number, { label: string; vibe: string }> = {
  1: { label: "You", vibe: "Identity, first impressions, how you show up" },
  2: { label: "Bag & fam", vibe: "Money, values, family, and how you speak" },
  3: { label: "Squad", vibe: "Siblings, courage, short trips, and your hustle" },
  4: { label: "Home base", vibe: "Roots, mother, property, and inner peace" },
  5: { label: "Main character", vibe: "Creativity, romance, kids, and fun" },
  6: { label: "Daily grind", vibe: "Health, routines, rivals, and service" },
  7: { label: "Partner era", vibe: "Marriage, business partners, and contracts" },
  8: { label: "Plot twist", vibe: "Transformation, secrets, longevity, and depth" },
  9: { label: "Big picture", vibe: "Luck, dharma, teachers, and long journeys" },
  10: { label: "Career arc", vibe: "Status, ambition, father, and public life" },
  11: { label: "Wins & network", vibe: "Gains, friends, hopes, and social circles" },
  12: { label: "Logout mode", vibe: "Rest, spirituality, losses, and the subconscious" },
}

function planetBadgeRadius(fontSize: number): number {
  return fontSize * 0.72
}

function handleInteractiveKeyDown(
  event: React.KeyboardEvent,
  action: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    action()
  }
}

function getHouseFill(
  houseNumber: number,
  isAscendant: boolean,
  selection: ChartSelection,
  hoveredHouse: number | null,
  selectedPlanetHouse: number | null
): string {
  const isSelected =
    selection?.type === "house" && selection.houseNumber === houseNumber
  const isPlanetHouse = selectedPlanetHouse === houseNumber
  const isHovered = hoveredHouse === houseNumber

  if (isSelected || isPlanetHouse) {
    return isAscendant
      ? "oklch(0.55 0.14 280 / 0.22)"
      : "oklch(0.55 0.1 280 / 0.16)"
  }

  if (isHovered) {
    return isAscendant
      ? "oklch(0.55 0.12 280 / 0.14)"
      : "oklch(0.55 0.08 280 / 0.1)"
  }

  return isAscendant ? "oklch(0.55 0.12 280 / 0.06)" : "transparent"
}

function getHouseOpacity(
  houseNumber: number,
  selection: ChartSelection,
  planetsByHouse: Map<number, PlanetPosition[]>
): number {
  if (!selection) return 1

  if (selection.type === "house") {
    return selection.houseNumber === houseNumber ? 1 : 0.45
  }

  const planet = planetsByHouse
    .get(houseNumber)
    ?.find((entry) => entry.planet === selection.planetName)

  return planet ? 1 : 0.45
}

interface PlanetBadgeProps {
  x: number
  y: number
  symbol: string
  name: string
  fontSize: number
  isActive: boolean
  isDimmed: boolean
  onSelect: () => void
  onHover: (active: boolean) => void
}

function PlanetBadge({
  x,
  y,
  symbol,
  name,
  fontSize,
  isActive,
  isDimmed,
  onSelect,
  onHover,
}: PlanetBadgeProps) {
  const radius = planetBadgeRadius(fontSize)
  const hitRadius = radius + 8

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${name} — tap for details`}
      aria-pressed={isActive}
      className={cn(
        "cursor-pointer outline-none transition-opacity duration-200",
        isDimmed && "opacity-35",
        !isDimmed && "opacity-100"
      )}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onKeyDown={(event) => handleInteractiveKeyDown(event, onSelect)}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <circle cx={x} cy={y} r={hitRadius} fill="transparent" />
      <circle
        cx={x}
        cy={y}
        r={radius + (isActive ? 2.5 : 0)}
        className={cn(
          "transition-all duration-200",
          isActive
            ? "fill-amber-500/30 stroke-amber-600/70 dark:fill-amber-400/25 dark:stroke-amber-300/70"
            : "fill-amber-500/15 stroke-amber-600/45 dark:fill-amber-400/15 dark:stroke-amber-400/40"
        )}
        strokeWidth={isActive ? 1.5 : 0.85}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize + (isActive ? 1 : 0)}
        className="pointer-events-none fill-amber-800 font-semibold transition-all duration-200 dark:fill-amber-300"
        style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
      >
        {symbol}
      </text>
    </g>
  )
}

function getPlanetPositions(group: NorthIndianPlanetGroup): Array<{
  planet: NorthIndianPlanetGroup["planets"][number]
  x: number
  y: number
}> {
  if (group.layout === "column") {
    const startY =
      group.centerY - ((group.planets.length - 1) * group.lineHeight) / 2

    return group.planets.map((planet, index) => ({
      planet,
      x: group.centerX,
      y: startY + index * group.lineHeight,
    }))
  }

  if (group.layout === "row") {
    const startX =
      group.centerX -
      ((group.planets.length - 1) * group.columnSpacing) / 2

    return group.planets.map((planet, index) => ({
      planet,
      x: startX + index * group.columnSpacing,
      y: group.centerY,
    }))
  }

  if (group.layout === "grid") {
    const totalWidth = (group.cols - 1) * group.columnSpacing
    const totalHeight = (group.rows - 1) * group.lineHeight
    const startX = group.centerX - totalWidth / 2
    const startY = group.centerY - totalHeight / 2

    return group.planets.map((planet, index) => {
      const col = index % group.cols
      const row = Math.floor(index / group.cols)
      return {
        planet,
        x: startX + col * group.columnSpacing,
        y: startY + row * group.lineHeight,
      }
    })
  }

  return [
    {
      planet: group.planets[0],
      x: group.centerX,
      y: group.centerY,
    },
  ]
}

interface RashiLabelProps {
  abbrev: string
  sign: string
  x: number
  y: number
  isAscendant: boolean
  isActive: boolean
}

function RashiLabel({
  abbrev,
  sign,
  x,
  y,
  isAscendant,
  isActive,
}: RashiLabelProps) {
  const pillWidth = abbrev.length * 5.8 + 10
  const pillHeight = 14
  const pillX = x - pillWidth / 2
  const pillY = y - pillHeight / 2 + 1

  return (
    <g className="pointer-events-none">
      <title>{sign}</title>
      <rect
        x={pillX}
        y={pillY}
        width={pillWidth}
        height={pillHeight}
        rx={4}
        className={cn(
          "transition-all duration-200",
          isActive || isAscendant
            ? "fill-primary/18 stroke-primary/45"
            : "fill-primary/8 stroke-primary/25"
        )}
        strokeWidth={isActive ? 1.1 : 0.75}
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isAscendant ? 10 : 9}
        className={
          isAscendant
            ? "fill-primary font-bold"
            : "fill-primary/85 font-semibold"
        }
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "0.04em",
        }}
      >
        {abbrev}
      </text>
    </g>
  )
}

interface ChartDetailPanelProps {
  chart: KundliChart
  selection: ChartSelection
  planetsByHouse: Map<number, PlanetPosition[]>
  onClear: () => void
}

function ChartDetailPanel({
  chart,
  selection,
  planetsByHouse,
  onClear,
}: ChartDetailPanelProps) {
  if (!selection) return null

  if (selection.type === "planet") {
    const planet = chart.planets.find((entry) => entry.planet === selection.planetName)
    if (!planet) return null

    const meta = PLANET_META[planet.planet]
    const theme = HOUSE_THEMES[planet.house]

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-card to-card p-4 duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-full border border-amber-600/40 bg-amber-500/20 text-xl font-semibold text-amber-800 dark:text-amber-300">
              {getPlanetSymbol(planet.planet)}
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">{planet.planet}</p>
              <p className="text-sm text-muted-foreground">
                {planet.sign} ({getRashiEnglishName(planet.sign)}) · House {planet.house}
                {theme ? ` · ${theme.label}` : ""}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Clear selection"
            onClick={onClear}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{planet.degree.toFixed(1)}° in sign</Badge>
          {meta?.nature && <Badge variant="secondary">{meta.nature}</Badge>}
        </div>
        {meta?.significance && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {meta.significance}
          </p>
        )}
      </div>
    )
  }

  const house = chart.houses.find((entry) => entry.house === selection.houseNumber)
  const planetsInHouse = planetsByHouse.get(selection.houseNumber) ?? []
  const theme = HOUSE_THEMES[selection.houseNumber]
  const sign = house?.sign ?? chart.lagna
  const isLagna = selection.houseNumber === 1

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {isLagna ? "Lagna" : `House ${selection.houseNumber}`}
            {theme && (
              <span className="ml-2 text-base font-medium text-primary">
                · {theme.label}
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {sign} ({getRashiEnglishName(sign)})
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear selection"
          onClick={onClear}
        >
          <X className="size-4" />
        </Button>
      </div>
      {theme && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {theme.vibe}
        </p>
      )}
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Planets here
        </p>
        {planetsInHouse.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {planetsInHouse.map((planet) => (
              <Badge
                key={planet.planet}
                variant="outline"
                className="gap-1.5 border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
              >
                <span>{getPlanetSymbol(planet.planet)}</span>
                {planet.planet}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-muted-foreground/80">
            No planets — this house is running solo.
          </p>
        )}
      </div>
    </div>
  )
}

export function BirthChartNorthIndian({
  chart,
  className,
}: BirthChartNorthIndianProps) {
  const houses = getNorthIndianHouses(chart)
  const planetGroups = layoutNorthIndianPlanetGroups(chart)
  const [selection, setSelection] = useState<ChartSelection>(null)
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null)
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)

  const planetsByHouse = useMemo(() => {
    const map = new Map<number, PlanetPosition[]>()
    for (const planet of chart.planets) {
      const list = map.get(planet.house) ?? []
      list.push(planet)
      map.set(planet.house, list)
    }
    return map
  }, [chart.planets])

  const selectedPlanetHouse = useMemo(() => {
    if (selection?.type !== "planet") return null
    return chart.planets.find((planet) => planet.planet === selection.planetName)?.house ?? null
  }, [chart.planets, selection])

  const selectHouse = useCallback((houseNumber: number) => {
    setSelection((current) =>
      current?.type === "house" && current.houseNumber === houseNumber
        ? null
        : { type: "house", houseNumber }
    )
  }, [])

  const selectPlanet = useCallback((planetName: string) => {
    setSelection((current) =>
      current?.type === "planet" && current.planetName === planetName
        ? null
        : { type: "planet", planetName }
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelection(null)
    setHoveredHouse(null)
    setHoveredPlanet(null)
  }, [])

  const hasSelection = selection !== null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>North Indian Birth Chart</CardTitle>
        <CardDescription>
          Lagna ({chart.lagna} / {getRashiEnglishName(chart.lagna)}) sits up top ·
          read counter-clockwise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground sm:text-sm">
          <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>Tap any house or planet to explore — your chart, your pace</span>
        </div>

        <div className="mx-auto flex max-w-md justify-center">
          <svg
            viewBox="0 0 400 400"
            role="img"
            aria-label={`North Indian Vedic birth chart with ascendant in ${chart.lagna}`}
            className="h-auto w-full max-w-[400px] touch-manipulation select-none"
            onClick={clearSelection}
          >
            <defs>
              <clipPath id="north-chart-clip">
                <path d={getNorthIndianFramePath()} />
              </clipPath>
            </defs>

            <rect
              x={0}
              y={0}
              width={400}
              height={400}
              fill="var(--card)"
              rx={2}
            />

            {houses.map((house) => {
              const isSelected =
                selection?.type === "house" &&
                selection.houseNumber === house.houseNumber
              const isPlanetHouse =
                selectedPlanetHouse === house.houseNumber ||
                (selection?.type === "planet" && hoveredPlanet &&
                  chart.planets.find((p) => p.planet === hoveredPlanet)?.house ===
                    house.houseNumber)

              return (
                <path
                  key={house.houseNumber}
                  d={house.path}
                  fill={getHouseFill(
                    house.houseNumber,
                    house.isAscendant,
                    selection,
                    hoveredHouse,
                    selectedPlanetHouse
                  )}
                  className={cn(
                    "cursor-pointer stroke-foreground/25 transition-all duration-200",
                    (isSelected || isPlanetHouse) && "stroke-primary/40",
                    hoveredHouse === house.houseNumber && "stroke-primary/30"
                  )}
                  strokeWidth={isSelected || isPlanetHouse ? 1.5 : 1}
                  opacity={getHouseOpacity(
                    house.houseNumber,
                    selection,
                    planetsByHouse
                  )}
                  role="button"
                  tabIndex={0}
                  aria-label={`House ${house.houseNumber}, ${house.sign}`}
                  aria-pressed={isSelected}
                  onClick={(event) => {
                    event.stopPropagation()
                    selectHouse(house.houseNumber)
                  }}
                  onKeyDown={(event) =>
                    handleInteractiveKeyDown(event, () =>
                      selectHouse(house.houseNumber)
                    )
                  }
                  onMouseEnter={() => setHoveredHouse(house.houseNumber)}
                  onMouseLeave={() => setHoveredHouse(null)}
                  onFocus={() => setHoveredHouse(house.houseNumber)}
                  onBlur={() => setHoveredHouse(null)}
                />
              )
            })}

            <path
              d={getNorthIndianFramePath()}
              fill="none"
              className="pointer-events-none stroke-foreground/70"
              strokeWidth={1.75}
            />

            <g clipPath="url(#north-chart-clip)">
              {planetGroups.map((group) => {
                const positions = getPlanetPositions(group)

                return (
                  <g key={group.houseNumber}>
                    {positions.map(({ planet, x, y }) => {
                      const isActive =
                        selection?.type === "planet" &&
                        selection.planetName === planet.name
                      const isDimmed =
                        hasSelection &&
                        !isActive &&
                        !(
                          selection?.type === "house" &&
                          selection.houseNumber === group.houseNumber
                        )

                      return (
                        <PlanetBadge
                          key={planet.name}
                          x={x}
                          y={y}
                          symbol={planet.symbol}
                          name={planet.name}
                          fontSize={group.fontSize}
                          isActive={isActive || hoveredPlanet === planet.name}
                          isDimmed={isDimmed}
                          onSelect={() => selectPlanet(planet.name)}
                          onHover={(active) =>
                            setHoveredPlanet(active ? planet.name : null)
                          }
                        />
                      )
                    })}
                  </g>
                )
              })}

              {houses.map((house) => {
                const isActive =
                  selection?.type === "house" &&
                  selection.houseNumber === house.houseNumber

                return (
                  <g
                    key={`label-${house.houseNumber}`}
                    className="pointer-events-none"
                    opacity={getHouseOpacity(
                      house.houseNumber,
                      selection,
                      planetsByHouse
                    )}
                  >
                    <text
                      x={house.labelX}
                      y={house.labelY - 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={7.5}
                      className={cn(
                        "font-medium uppercase transition-colors duration-200",
                        isActive || hoveredHouse === house.houseNumber
                          ? "fill-primary"
                          : "fill-muted-foreground/90"
                      )}
                      style={{
                        fontFamily: "ui-sans-serif, system-ui, sans-serif",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {house.isAscendant ? "Lagna" : `H${house.houseNumber}`}
                    </text>
                    <RashiLabel
                      abbrev={house.abbrev}
                      sign={house.sign}
                      x={house.labelX}
                      y={house.labelY + 9}
                      isAscendant={house.isAscendant}
                      isActive={
                        isActive ||
                        selectedPlanetHouse === house.houseNumber ||
                        hoveredHouse === house.houseNumber
                      }
                    />
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        <ChartDetailPanel
          chart={chart}
          selection={selection}
          planetsByHouse={planetsByHouse}
          onClear={clearSelection}
        />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 min-w-7 items-center justify-center rounded border border-primary/25 bg-primary/10 px-1 text-[9px] font-semibold text-primary">
              Mes
            </span>
            <span>Raashi (sign)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex size-5 items-center justify-center rounded-full border border-amber-600/40 bg-amber-500/15 text-xs font-semibold text-amber-800 dark:text-amber-300">
              ☉
            </span>
            <span>Planet — tap to learn more</span>
          </span>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          {chart.planets.map((planet) => {
            const isActive =
              selection?.type === "planet" &&
              selection.planetName === planet.planet

            return (
              <button
                key={planet.planet}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectPlanet(planet.planet)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-all duration-200",
                  "hover:border-amber-500/40 hover:bg-amber-500/10 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  isActive
                    ? "border-amber-500/50 bg-amber-500/15 shadow-sm ring-1 ring-amber-500/30"
                    : "border-border/80 bg-muted/30"
                )}
              >
                <span className="inline-flex size-5 items-center justify-center rounded-full border border-amber-600/40 bg-amber-500/15 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {getPlanetSymbol(planet.planet)}
                </span>
                <span className="font-medium text-foreground">{planet.planet}</span>
                <span>
                  · {planet.sign} · H{planet.house}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
