"use client"

import { CheckCircle2 } from "lucide-react"

import { BirthChartWheel } from "@/components/astrology/birth-chart-wheel"
import { ChartSummary } from "@/components/astrology/chart-summary"
import { PlanetTable } from "@/components/astrology/planet-table"
import { ZodiacCard } from "@/components/astrology/zodiac-card"
import { getInterpretationsForChart } from "@/lib/astrology"
import type { AstrologyChart, BirthDetails } from "@/types/astrology"

interface ChartResultsProps {
  chart: AstrologyChart
  birthDetails: BirthDetails
}

export function ChartResults({ chart, birthDetails }: ChartResultsProps) {
  const interpretations = getInterpretationsForChart(chart)

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
            Chart generated successfully
          </p>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
            Vedic chart for {birthDetails.name} · {birthDetails.birthDate} at{" "}
            {birthDetails.birthTime} · {birthDetails.birthPlace}
          </p>
        </div>
      </div>

      <BirthChartWheel chart={chart} />
      <ChartSummary chart={chart} />
      <PlanetTable planets={chart.planets} />

      <section aria-labelledby="interpretations-heading">
        <h2 id="interpretations-heading" className="mb-4 text-xl font-semibold">
          Interpretations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ZodiacCard
            title="Ascendant (Lagna)"
            value={chart.ascendant}
            interpretation={interpretations.ascendant}
            type="sign"
          />
          <ZodiacCard
            title="Moon Sign (Rashi)"
            value={chart.moonSign}
            interpretation={interpretations.moonSign}
            type="sign"
          />
          <ZodiacCard
            title="Sun Sign"
            value={chart.sunSign}
            interpretation={interpretations.sunSign}
            type="sign"
          />
          <ZodiacCard
            title="Nakshatra"
            value={chart.nakshatra}
            interpretation={interpretations.nakshatra}
            type="nakshatra"
          />
        </div>
      </section>
    </div>
  )
}
