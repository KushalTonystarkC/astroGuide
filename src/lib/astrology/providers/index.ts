import { AstrologyApiProvider } from "@/lib/astrology/providers/astrology/astrology-api"
import { ProkeralaAstrologyProvider } from "@/lib/astrology/providers/astrology/prokerala"
import {
  createSwissEphemerisProvider,
  type AstrologyProviderName,
} from "@/lib/astrology/providers/astrology/swiss-ephemeris"
import type { AstrologyProvider } from "@/lib/astrology/types"

export function getAstrologyProviderName(): AstrologyProviderName {
  const env = process.env.ASTROLOGY_PROVIDER?.toLowerCase()
  if (
    env === "prokerala" ||
    env === "astrology-api" ||
    env === "swiss-ephemeris"
  ) {
    return env
  }
  return "swiss-ephemeris"
}

export function createAstrologyProvider(
  name?: AstrologyProviderName
): AstrologyProvider {
  const provider = name ?? getAstrologyProviderName()

  switch (provider) {
    case "prokerala":
      return new ProkeralaAstrologyProvider()
    case "astrology-api":
      return new AstrologyApiProvider()
    case "swiss-ephemeris":
    default:
      return createSwissEphemerisProvider()
  }
}
