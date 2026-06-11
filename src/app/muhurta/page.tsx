import type { Metadata } from "next"
import { Suspense } from "react"

import { MuhurtaPageWrapper } from "@/components/astrology/muhurta-page-wrapper"
import { MandalaLoader } from "@/components/astrology/mandala-loader"

export const metadata: Metadata = {
  title: "Muhurta Finder",
  description:
    "Find auspicious muhurta windows for marriage, travel, business, and other undertakings.",
}

function MuhurtaLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <MandalaLoader size={48} />
    </div>
  )
}

export default function MuhurtaRoutePage() {
  return (
    <Suspense fallback={<MuhurtaLoading />}>
      <MuhurtaPageWrapper />
    </Suspense>
  )
}
