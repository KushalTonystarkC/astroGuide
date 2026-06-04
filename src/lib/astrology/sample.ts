import type { KundliChart } from "@/lib/astrology/types"

/**
 * Static sample chart for UI preview only — not produced by the astrology engine.
 */
export const SAMPLE_KUNDLI: KundliChart = {
  lagna: "Vrischika",
  moonSign: "Vrishabha",
  nakshatra: { name: "Rohini", pada: 2 },
  planets: [
    { planet: "Sun", sign: "Simha", degree: 28.5, house: 10 },
    { planet: "Moon", sign: "Vrishabha", degree: 12.3, house: 7 },
    { planet: "Mars", sign: "Kanya", degree: 5.1, house: 11 },
    { planet: "Mercury", sign: "Simha", degree: 15.8, house: 10 },
    { planet: "Venus", sign: "Karka", degree: 22.4, house: 9 },
    { planet: "Jupiter", sign: "Dhanu", degree: 8.7, house: 2 },
    { planet: "Saturn", sign: "Kumbha", degree: 19.2, house: 4 },
    { planet: "Rahu", sign: "Vrishabha", degree: 5.0, house: 7 },
    { planet: "Ketu", sign: "Vrischika", degree: 5.0, house: 1 },
  ],
  houses: [
    { house: 1, sign: "Vrischika" },
    { house: 2, sign: "Dhanu" },
    { house: 3, sign: "Makara" },
    { house: 4, sign: "Kumbha" },
    { house: 5, sign: "Meena" },
    { house: 6, sign: "Mesha" },
    { house: 7, sign: "Vrishabha" },
    { house: 8, sign: "Mithuna" },
    { house: 9, sign: "Karka" },
    { house: 10, sign: "Simha" },
    { house: 11, sign: "Kanya" },
    { house: 12, sign: "Tula" },
  ],
}

export function getSampleKundli(): KundliChart {
  return {
    ...SAMPLE_KUNDLI,
    nakshatra: { ...SAMPLE_KUNDLI.nakshatra },
    planets: SAMPLE_KUNDLI.planets.map((p) => ({ ...p })),
    houses: SAMPLE_KUNDLI.houses.map((h) => ({ ...h })),
  }
}
