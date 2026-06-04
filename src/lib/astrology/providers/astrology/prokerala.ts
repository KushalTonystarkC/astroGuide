import { AstrologyProviderNotConfiguredError } from "@/lib/astrology/errors"
import type {
  AstrologyProvider,
  BirthDetails,
  KundliChart,
  Location,
} from "@/lib/astrology/types"

/**
 * Prokerala API provider — placeholder for external API integration.
 *
 * Future implementation:
 * - POST to Prokerala Kundli endpoint with datetime + coordinates
 * - Map API response to RawChartData
 * - Call assembleKundliChart() for consistent domain output
 */
export class ProkeralaAstrologyProvider implements AstrologyProvider {
  async generateChart(
    birthDetails: BirthDetails,
    location: Location
  ): Promise<KundliChart> {
    void birthDetails
    void location
    throw new AstrologyProviderNotConfiguredError("Prokerala API")
  }
}
