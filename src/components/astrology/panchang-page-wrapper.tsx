"use client"

import { PanchangPage } from "@/components/astrology/panchang-page-client"
import { useVedicLocation } from "@/components/astrology/vedic-location-provider"

export function PanchangPageWrapper() {
  const { location } = useVedicLocation()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <PanchangPage defaultLocation={location} />
    </div>
  )
}
