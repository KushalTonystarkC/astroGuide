import type { Metadata } from "next"
import { Suspense } from "react"

import { TransitsPageWrapper } from "@/components/astrology/transits-page-wrapper"
import { MandalaLoader } from "@/components/astrology/mandala-loader"

export const metadata: Metadata = {
  title: "Planetary Transits",
  description:
    "Year-long Vedic planetary transit timeline with sign ingresses, nakshatra changes, and retrograde stations.",
}

function TransitsLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <MandalaLoader size={48} />
    </div>
  )
}

export default function TransitsRoutePage() {
  return (
    <Suspense fallback={<TransitsLoading />}>
      <TransitsPageWrapper />
    </Suspense>
  )
}
