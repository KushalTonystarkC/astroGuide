import { Moon, Sparkles, Star, Sunrise } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import type { KundliChart } from "@/lib/astrology/types"

interface ChartSummaryProps {
  chart: KundliChart
}

export function ChartSummary({ chart }: ChartSummaryProps) {
  const sun = chart.planets.find((p) => p.planet === "Sun")

  const items = [
    {
      label: "Ascendant (Lagna)",
      icon: Sunrise,
      value: `${chart.lagna} · ${getRashiEnglishName(chart.lagna)}`,
    },
    {
      label: "Moon Sign (Rashi)",
      icon: Moon,
      value: `${chart.moonSign} · ${getRashiEnglishName(chart.moonSign)}`,
    },
    {
      label: "Nakshatra",
      icon: Star,
      value: `${chart.nakshatra.name} · Pada ${chart.nakshatra.pada}`,
    },
    {
      label: "Sun Sign",
      icon: Sparkles,
      value: sun
        ? `${sun.sign} · ${getRashiEnglishName(sun.sign)}`
        : "—",
    },
  ]

  return (
    <section aria-labelledby="chart-summary-heading">
      <h2 id="chart-summary-heading" className="mb-4 text-xl font-semibold">
        Birth Chart Summary
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ label, icon: Icon, value }) => (
          <Card key={label} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <CardDescription>{label}</CardDescription>
              </div>
              <CardTitle className="text-lg leading-snug">{value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Sidereal (Vedic) placement
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
