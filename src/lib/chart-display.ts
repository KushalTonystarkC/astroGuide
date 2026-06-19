import type { KundliChart } from "@/lib/astrology/types"
import type { ChartData } from "@/types/vedic-api"

export interface ChartSummary {
  lagna: string
  moonSign: string
  nakshatra: { name: string; pada: number }
}

export function isVedicChartData(
  chartData: ChartData | KundliChart
): chartData is ChartData {
  return "ascendant" in chartData && "planets_data" in chartData
}

export function getChartSummary(
  chartData: ChartData | KundliChart
): ChartSummary {
  if (isVedicChartData(chartData)) {
    const moon = chartData.planets_data.find((p) => p.name === "Moon")
    return {
      lagna: chartData.ascendant.sign,
      moonSign: moon?.sign ?? "—",
      nakshatra: {
        name: moon?.nakshatra ?? "—",
        pada: moon?.nakshatra_pada ?? 0,
      },
    }
  }

  return {
    lagna: chartData.lagna,
    moonSign: chartData.moonSign,
    nakshatra: chartData.nakshatra,
  }
}
