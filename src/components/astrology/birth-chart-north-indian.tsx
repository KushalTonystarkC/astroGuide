"use client"

import { useMemo } from "react"

import { generateNorthIndianChartSvg } from "@/lib/astrology/north-indian-chart-svg"
import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import type { KundliChart } from "@/lib/astrology/types"
import { cn } from "@/lib/utils"

interface BirthChartNorthIndianProps {
  chart: KundliChart
  className?: string
}

export function BirthChartNorthIndian({
  chart,
  className,
}: BirthChartNorthIndianProps) {
  const chartSvg = useMemo(
    () => generateNorthIndianChartSvg(chart, { width: 450, height: 350 }),
    [chart]
  )

  return (
    <div className={cn("mx-auto w-full max-w-lg", className)}>
      <div
        className="flex justify-center [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-[400px]"
        dangerouslySetInnerHTML={{ __html: chartSvg }}
      />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Lagna ({chart.lagna} / {getRashiEnglishName(chart.lagna)}) in house 1 ·
        read counter-clockwise
      </p>
    </div>
  )
}
