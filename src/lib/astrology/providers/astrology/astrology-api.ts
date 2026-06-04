import { AstrologyProviderNotConfiguredError } from "@/lib/astrology/errors"
import type {
  AstrologyProvider,
  BirthDetails,
  KundliChart,
  Location,
} from "@/lib/astrology/types"

/**
 * Generic third-party Astrology API provider — placeholder.
 *
 * Future implementation:
 * - Configure ASTROLOGY_API_KEY and endpoint URL
 * - Request sidereal/Vedic chart data
 * - Normalize to RawChartData and assembleKundliChart()
 */
export class AstrologyApiProvider implements AstrologyProvider {
  async generateChart(
    birthDetails: BirthDetails,
    location: Location
  ): Promise<KundliChart> {
    void birthDetails
    void location
    throw new AstrologyProviderNotConfiguredError("Astrology API")
  }
}
