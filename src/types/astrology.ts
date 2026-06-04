export interface PlanetPosition {
  name: string
  sign: string
}

export interface AstrologyChart {
  ascendant: string
  moonSign: string
  sunSign: string
  nakshatra: string
  planets: PlanetPosition[]
}

export interface BirthDetails {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
}

export interface SavedChart {
  id: string
  createdAt: string
  birthDetails: BirthDetails
  chartData: AstrologyChart
}

export interface AstrologyApiRequest {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
}

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
