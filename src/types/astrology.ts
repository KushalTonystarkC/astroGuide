/** Interpretation metadata for UI display (loaded from JSON datasets). */

export interface SignInterpretation {
  name: string
  element: string
  ruler: string
  summary: string
  traits: string[]
}

export interface NakshatraInterpretation {
  name: string
  deity: string
  symbol: string
  summary: string
}

export interface PlanetInfo {
  name: string
  symbol: string
  nature: string
  significance: string
}
