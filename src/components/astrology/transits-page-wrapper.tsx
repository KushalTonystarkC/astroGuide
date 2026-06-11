"use client"

import { TransitsPage } from "@/components/astrology/transits-page-client"
import { useVedicLocation } from "@/components/astrology/vedic-location-provider"

export function TransitsPageWrapper() {
  const { location } = useVedicLocation()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <TransitsPage defaultLocation={location} />
    </div>
  )
}
