/**
 * Core domain types for the Vedic astrology engine.
 */

export interface BirthDetails {
  date: string
  time: string
  place: string
}

export interface Location {
  latitude: number
  longitude: number
  timezone: string
  displayName?: string
}

export interface PlanetPosition {
  planet: string
  sign: string
  degree: number
  house: number
  isRetrograde?: boolean
}

export interface HousePosition {
  house: number
  sign: string
}

export interface NakshatraInfo {
  name: string
  pada: number
}

export interface KundliChart {
  lagna: string
  moonSign: string
  nakshatra: NakshatraInfo
  planets: PlanetPosition[]
  houses: HousePosition[]
  /** North Indian chart SVG from vedic-calc, when available */
  chartSvg?: string
  /** Resolved birth-place coordinates */
  location?: Location
}

export interface PlaceSuggestion {
  displayName: string
  latitude: number
  longitude: number
}

/** Raw sidereal longitudes from an ephemeris provider (0–360°). */
export interface SiderealLongitude {
  planet: string
  longitude: number
}

export interface RawChartData {
  ascendantLongitude: number
  positions: SiderealLongitude[]
}

export interface Geocoder {
  geocode(place: string): Promise<Location>
}

export interface AstrologyProvider {
  generateChart(
    birthDetails: BirthDetails,
    location: Location
  ): Promise<KundliChart>
}

export type AyanamsaType = "lahiri" | "raman" | "krishnamurti" | "yukteshwar"

export interface SwissEphemerisChartParams {
  julianDayUt: number
  latitude: number
  longitude: number
  ayanamsa: AyanamsaType
}

/**
 * Integration point for a maintained Swiss Ephemeris package.
 * Implement this adapter when wiring sweph, swisseph, or similar.
 */
export interface SwissEphemerisAdapter {
  calculateSiderealChart(params: SwissEphemerisChartParams): Promise<RawChartData>
}
