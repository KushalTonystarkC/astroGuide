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

/** Primary seven grahas displayed in standard Kundli tables. */
export const SEVEN_GRAHAS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
] as const satisfies readonly GrahaName[]
