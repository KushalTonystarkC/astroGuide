"use client"

import { BirthChartNorthIndian } from "@/components/astrology/birth-chart-north-indian"
import { PlanetTable } from "@/components/astrology/planet-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import type { KundliChart } from "@/lib/astrology/types"

interface KundliReportProps {
  chart: KundliChart
}

export function KundliReport({ chart }: KundliReportProps) {
  return (
    <Card className="overflow-hidden border-primary/20 shadow-md">
      <CardHeader className="border-b border-border/60 bg-primary/[0.03] pb-4">
        <CardTitle className="text-xl">North Indian Birth Chart</CardTitle>
        <CardDescription>
          Vedic Kundli with Lagna ({chart.lagna} /{" "}
          {getRashiEnglishName(chart.lagna)}) in the top center house
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <BirthChartNorthIndian chart={chart} />
        <PlanetTable planets={chart.planets} />
      </CardContent>
    </Card>
  )
}
