import { Suspense } from "react"

import { ChartPageClient } from "@/components/astrology/chart-page-client"
import { ChartLoadingState } from "@/components/astrology/loading-state"

export const metadata = {
  title: "Generate Chart",
}

export default function ChartPage() {
  return (
    <Suspense fallback={<ChartLoadingState />}>
      <ChartPageClient />
    </Suspense>
  )
}
