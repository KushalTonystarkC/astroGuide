import { Moon, Sparkles, Star, Sunrise } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AstrologyChart } from "@/types/astrology"

interface ChartSummaryProps {
  chart: AstrologyChart
}

const summaryItems = [
  { key: "ascendant" as const, label: "Ascendant (Lagna)", icon: Sunrise },
  { key: "moonSign" as const, label: "Moon Sign (Rashi)", icon: Moon },
  { key: "sunSign" as const, label: "Sun Sign", icon: Sparkles },
  { key: "nakshatra" as const, label: "Nakshatra", icon: Star },
]

export function ChartSummary({ chart }: ChartSummaryProps) {
  return (
    <section aria-labelledby="chart-summary-heading">
      <h2 id="chart-summary-heading" className="mb-4 text-xl font-semibold">
        Birth Chart Summary
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryItems.map(({ key, label, icon: Icon }) => (
          <Card
            key={key}
            className="transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <CardDescription>{label}</CardDescription>
              </div>
              <CardTitle className="text-2xl">{chart[key]}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Vedic placement for your cosmic blueprint
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
