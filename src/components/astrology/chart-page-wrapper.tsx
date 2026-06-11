"use client"

import { KundaliPage } from "@/components/astrology/kundali-page-client"
import { useVedicLocation } from "@/components/astrology/vedic-location-provider"

export function ChartPageWrapper() {
  const { location, setLocation } = useVedicLocation()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <KundaliPage
        sharedLocation={location}
        onLocationChange={setLocation}
      />
    </div>
  )
}
