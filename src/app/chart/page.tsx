import type { Metadata } from "next"
import { Suspense } from "react"

import { ChartPageWrapper } from "@/components/astrology/chart-page-wrapper"
import { MandalaLoader } from "@/components/astrology/mandala-loader"

export const metadata: Metadata = {
  title: "Generate Chart",
  description:
    "Generate a Vedic Kundali birth chart with divisional charts, dasha, ashtakavarga, and Jaimini analysis.",
}

function ChartLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <MandalaLoader size={48} />
    </div>
  )
}

export default function ChartPage() {
  return (
    <Suspense fallback={<ChartLoading />}>
      <ChartPageWrapper />
    </Suspense>
  )
}
