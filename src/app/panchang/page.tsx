import type { Metadata } from "next"
import { Suspense } from "react"

import { PanchangPageWrapper } from "@/components/astrology/panchang-page-wrapper"
import { MandalaLoader } from "@/components/astrology/mandala-loader"

export const metadata: Metadata = {
  title: "Daily Panchang",
  description:
    "Daily Drik Panchang with tithi, nakshatra, yoga, karana, muhurta windows, and more.",
}

function PanchangLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <MandalaLoader size={48} />
    </div>
  )
}

export default function PanchangRoutePage() {
  return (
    <Suspense fallback={<PanchangLoading />}>
      <PanchangPageWrapper />
    </Suspense>
  )
}
