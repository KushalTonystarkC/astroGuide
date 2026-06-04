/**
 * Transit calculations — interfaces only (future implementation).
 */

export interface TransitPosition {
  planet: string
  longitude: number
  sign: string
  house: number
}

export interface TransitSnapshot {
  calculatedAt: string
  transits: TransitPosition[]
}

export interface TransitCalculator {
  calculateForDate(
    natalAscendantLongitude: number,
    transitDate: string
  ): Promise<TransitSnapshot>
}
