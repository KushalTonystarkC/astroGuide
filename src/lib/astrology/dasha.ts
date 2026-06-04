/**
 * Vimshottari Dasha — interfaces only (future implementation).
 */

export interface DashaPeriod {
  lord: string
  startDate: string
  endDate: string
  level: "mahadasha" | "antardasha" | "pratyantardasha"
}

export interface VimshottariDashaTimeline {
  birthNakshatraLord: string
  mahadashas: DashaPeriod[]
}

export interface DashaCalculator {
  calculate(
    moonLongitude: number,
    birthDate: string
  ): Promise<VimshottariDashaTimeline>
}
