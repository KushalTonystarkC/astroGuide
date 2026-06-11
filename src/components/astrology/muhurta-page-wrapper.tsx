"use client"

import { MuhurtaPage } from "@/components/astrology/muhurta-page-client"
import { useVedicLocation } from "@/components/astrology/vedic-location-provider"

export function MuhurtaPageWrapper() {
  const { location } = useVedicLocation()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <MuhurtaPage defaultLocation={location} />
    </div>
  )
}
