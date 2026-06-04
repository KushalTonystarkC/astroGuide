/**
 * Vedic grahas used in Kundli generation.
 * Rahu and Ketu included for future transit/dasha features.
 */

export const GRAHAS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const

export type GrahaName = (typeof GRAHAS)[number]

/** Classical seven grahas (Swiss Ephemeris planet IDs). Rahu/Ketu are computed separately. */
export const SEVEN_GRAHAS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
] as const satisfies readonly GrahaName[]
