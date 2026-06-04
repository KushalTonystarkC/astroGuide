import { GRAHAS, SEVEN_GRAHAS, type GrahaName } from "@/data/planets"
import { formatPlanetPosition } from "@/lib/astrology/calculations"
import type { PlanetPosition, SiderealLongitude } from "@/lib/astrology/types"

export { GRAHAS, SEVEN_GRAHAS, type GrahaName }

export function buildPlanetPositions(
  positions: SiderealLongitude[],
  ascendantLongitude: number,
  grahas: readonly string[] = SEVEN_GRAHAS
): PlanetPosition[] {
  const longitudeByPlanet = new Map(
    positions.map((entry) => [entry.planet, entry.longitude])
  )

  return grahas
    .filter((graha) => longitudeByPlanet.has(graha))
    .map((graha) =>
      formatPlanetPosition(
        graha,
        longitudeByPlanet.get(graha)!,
        ascendantLongitude
      )
    )
}

export function findPlanetLongitude(
  positions: SiderealLongitude[],
  planet: string
): number | undefined {
  return positions.find((entry) => entry.planet === planet)?.longitude
}
