import signsData from "@/data/signs.json"
import nakshatrasData from "@/data/nakshatras.json"
import planetsData from "@/data/planets.json"
import {
  NAKSHATRAS,
  PLANET_NAMES,
  SAMPLE_CHART,
  ZODIAC_SIGNS,
} from "@/lib/constants"
import type {
  AstrologyChart,
  BirthDetails,
  NakshatraInterpretation,
  PlanetInfo,
  PlanetPosition,
  SignInterpretation,
} from "@/types/astrology"

type SignsRecord = Record<string, SignInterpretation>
type NakshatrasRecord = Record<string, NakshatraInterpretation>
type PlanetsRecord = Record<string, PlanetInfo>

const signs = signsData as SignsRecord
const nakshatras = nakshatrasData as NakshatrasRecord
const planets = planetsData as PlanetsRecord

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pickFromArray<T>(arr: readonly T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length]
}

/**
 * Mock astrology engine — deterministic results from birth details.
 * Replace this function with a real provider integration later.
 */
export function generateMockChart(birthDetails: BirthDetails): AstrologyChart {
  const seed = hashString(
    `${birthDetails.name}|${birthDetails.birthDate}|${birthDetails.birthTime}|${birthDetails.birthPlace}`
  )

  const ascendant = pickFromArray(ZODIAC_SIGNS, seed, 0)
  const moonSign = pickFromArray(ZODIAC_SIGNS, seed, 3)
  const sunSign = pickFromArray(ZODIAC_SIGNS, seed, 7)
  const nakshatra = pickFromArray(NAKSHATRAS, seed, 11)

  const planetPositions: PlanetPosition[] = PLANET_NAMES.map((name, index) => ({
    name,
    sign: pickFromArray(ZODIAC_SIGNS, seed, index + 2),
  }))

  return {
    ascendant,
    moonSign,
    sunSign,
    nakshatra,
    planets: planetPositions,
  }
}

export function getSampleChart(): AstrologyChart {
  return { ...SAMPLE_CHART, planets: [...SAMPLE_CHART.planets] }
}

export function getSignInterpretation(sign: string): SignInterpretation | null {
  return signs[sign] ?? null
}

export function getNakshatraInterpretation(
  nakshatra: string
): NakshatraInterpretation | null {
  return nakshatras[nakshatra] ?? null
}

export function getPlanetInfo(planetName: string): PlanetInfo | null {
  return planets[planetName] ?? null
}

export function getInterpretationsForChart(chart: AstrologyChart) {
  return {
    ascendant: getSignInterpretation(chart.ascendant),
    moonSign: getSignInterpretation(chart.moonSign),
    sunSign: getSignInterpretation(chart.sunSign),
    nakshatra: getNakshatraInterpretation(chart.nakshatra),
  }
}

export async function fetchChartFromApi(
  birthDetails: BirthDetails
): Promise<AstrologyChart> {
  const response = await fetch("/api/astrology", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(birthDetails),
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(errorBody?.error ?? "Failed to generate chart")
  }

  return response.json() as Promise<AstrologyChart>
}
