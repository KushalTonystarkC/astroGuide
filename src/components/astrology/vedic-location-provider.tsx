"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { fetchGeoIP } from "@/lib/vedic/api"
import type { LocationChoice } from "@/types/vedic-api"

const DEFAULT_LOCATION: LocationChoice = {
  place_name: "Ujjain, Madhya Pradesh, India",
  latitude: 23.1765,
  longitude: 75.7885,
  timezone: "Asia/Kolkata",
}

interface VedicLocationContextValue {
  location: LocationChoice
  setLocation: (loc: LocationChoice) => void
}

const VedicLocationContext = createContext<VedicLocationContextValue | null>(
  null
)

export function VedicLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationChoice>(DEFAULT_LOCATION)
  const geoFetchedRef = useRef(false)

  useEffect(() => {
    if (geoFetchedRef.current) return
    geoFetchedRef.current = true
    fetchGeoIP().then((geo) => {
      if (geo) {
        setLocation({
          place_name: geo.place_name,
          latitude: geo.latitude,
          longitude: geo.longitude,
          timezone: null,
        })
      }
    })
  }, [])

  return (
    <VedicLocationContext.Provider value={{ location, setLocation }}>
      {children}
    </VedicLocationContext.Provider>
  )
}

export function useVedicLocation() {
  const ctx = useContext(VedicLocationContext)
  if (!ctx) {
    throw new Error("useVedicLocation must be used within VedicLocationProvider")
  }
  return ctx
}
