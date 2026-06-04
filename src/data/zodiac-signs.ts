/**
 * 12 Vedic Rashis (sidereal zodiac signs).
 * Single source of truth — do not duplicate elsewhere.
 */

export const RASHIS = [
  "Mesha",
  "Vrishabha",
  "Mithuna",
  "Karka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrischika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
] as const

export type RashiName = (typeof RASHIS)[number]

/** English display names for UI and interpretation lookups. */
export const RASHI_ENGLISH_NAMES: Record<RashiName, string> = {
  Mesha: "Aries",
  Vrishabha: "Taurus",
  Mithuna: "Gemini",
  Karka: "Cancer",
  Simha: "Leo",
  Kanya: "Virgo",
  Tula: "Libra",
  Vrischika: "Scorpio",
  Dhanu: "Sagittarius",
  Makara: "Capricorn",
  Kumbha: "Aquarius",
  Meena: "Pisces",
}

export const ENGLISH_TO_RASHI: Record<string, RashiName> = Object.fromEntries(
  RASHIS.map((rashi) => [RASHI_ENGLISH_NAMES[rashi], rashi])
) as Record<string, RashiName>

export const RASHI_ABBREVIATIONS: Record<RashiName, string> = {
  Mesha: "Mes",
  Vrishabha: "Vri",
  Mithuna: "Mit",
  Karka: "Kar",
  Simha: "Sim",
  Kanya: "Kan",
  Tula: "Tul",
  Vrischika: "Vsc",
  Dhanu: "Dha",
  Makara: "Mak",
  Kumbha: "Kum",
  Meena: "Mee",
}
