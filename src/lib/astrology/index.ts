import type { BirthDetails as KundliBirthDetails } from "@/lib/astrology/types"
import type { KundliChart } from "@/lib/astrology/types"

export type {
  AstrologyProvider,
  BirthDetails,
  Geocoder,
  HousePosition,
  KundliChart,
  Location,
  NakshatraInfo,
  PlanetPosition,
  RawChartData,
  SiderealLongitude,
  SwissEphemerisAdapter,
} from "@/lib/astrology/types"

import signsData from "@/data/signs.json"
import nakshatrasData from "@/data/nakshatras.json"
import planetsData from "@/data/planets.json"
import { RASHI_ENGLISH_NAMES } from "@/data/zodiac-signs"
import type {
  NakshatraInterpretation,
  PlanetInfo,
  SignInterpretation,
} from "@/types/astrology"

type SignsRecord = Record<string, SignInterpretation>
type PlanetsRecord = Record<string, PlanetInfo>

const signs = signsData as SignsRecord
const nakshatrasMap = nakshatrasData as Record<string, NakshatraInterpretation>
const planets = planetsData as PlanetsRecord

function toEnglishSign(rashi: string): string {
  return (
    RASHI_ENGLISH_NAMES[rashi as keyof typeof RASHI_ENGLISH_NAMES] ?? rashi
  )
}

export function getSignInterpretation(
  rashi: string
): SignInterpretation | null {
  return signs[toEnglishSign(rashi)] ?? null
}

export function getNakshatraInterpretation(
  nakshatra: string
): NakshatraInterpretation | null {
  return nakshatrasMap[nakshatra] ?? null
}

export function getPlanetInfo(planetName: string): PlanetInfo | null {
  return planets[planetName] ?? null
}

export function getInterpretationsForChart(chart: KundliChart) {
  const sun = chart.planets.find((p) => p.planet === "Sun")
  return {
    lagna: getSignInterpretation(chart.lagna),
    moonSign: getSignInterpretation(chart.moonSign),
    sunSign: sun ? getSignInterpretation(sun.sign) : null,
    nakshatra: getNakshatraInterpretation(chart.nakshatra.name),
  }
}

export { getSampleKundli } from "@/lib/astrology/sample"

/**
 * Client entry point — calls POST /api/kundli. No calculations in the browser.
 */
export async function generateKundli(
  input: KundliBirthDetails
): Promise<KundliChart> {
  const response = await fetch("/api/kundli", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string
      code?: string
    } | null
    throw new Error(errorBody?.error ?? "Failed to generate Kundli")
  }

  return response.json() as Promise<KundliChart>
}
