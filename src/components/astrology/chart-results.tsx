"use client"

import { CheckCircle2 } from "lucide-react"

import { BirthChartNorthIndian } from "@/components/astrology/birth-chart-north-indian"
import { ChartSummary } from "@/components/astrology/chart-summary"
import { HouseTable } from "@/components/astrology/house-table"
import { PlanetTable } from "@/components/astrology/planet-table"
import { ZodiacCard } from "@/components/astrology/zodiac-card"
import { getInterpretationsForChart } from "@/lib/astrology"
import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import type { KundliChart } from "@/lib/astrology/types"
import type { BirthDetails } from "@/types/birth"

interface ChartResultsProps {
  chart: KundliChart
  birthDetails: BirthDetails
}

export function ChartResults({ chart, birthDetails }: ChartResultsProps) {
  const interpretations = getInterpretationsForChart(chart)
  const sun = chart.planets.find((p) => p.planet === "Sun")
  const nakshatraLabel = `${chart.nakshatra.name} (Pada ${chart.nakshatra.pada})`

  return (
    <div className="space-y-10">
      <div
        className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
        role="status"
      >
        <CheckCircle2
          className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-emerald-900 dark:text-emerald-100">
            Kundli generated successfully
          </p>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
            Vedic chart for {birthDetails.name} · {birthDetails.date} at{" "}
            {birthDetails.time} · {birthDetails.place}
          </p>
        </div>
      </div>

      <BirthChartNorthIndian chart={chart} />
      <ChartSummary chart={chart} />
      <PlanetTable planets={chart.planets} />
      <HouseTable houses={chart.houses} />

      <section aria-labelledby="interpretations-heading">
        <h2 id="interpretations-heading" className="mb-4 text-xl font-semibold">
          Interpretations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ZodiacCard
            title="Ascendant (Lagna)"
            value={`${chart.lagna} (${getRashiEnglishName(chart.lagna)})`}
            interpretation={interpretations.lagna}
            type="sign"
          />
          <ZodiacCard
            title="Moon Sign (Rashi)"
            value={`${chart.moonSign} (${getRashiEnglishName(chart.moonSign)})`}
            interpretation={interpretations.moonSign}
            type="sign"
          />
          {sun && (
            <ZodiacCard
              title="Sun Sign"
              value={`${sun.sign} (${getRashiEnglishName(sun.sign)})`}
              interpretation={interpretations.sunSign}
              type="sign"
            />
          )}
          <ZodiacCard
            title="Nakshatra"
            value={nakshatraLabel}
            interpretation={interpretations.nakshatra}
            type="nakshatra"
          />
        </div>
      </section>
    </div>
  )
}
