import { RASHIS } from "@/data/zodiac-signs"
import { getSignIndex } from "@/lib/astrology/calculations"
import { HOUSES_COUNT } from "@/lib/astrology/constants"
import type { HousePosition } from "@/lib/astrology/types"

/**
 * Whole-sign house cusps: each house occupies one complete Rashi,
 * starting from the Lagna sign as house 1.
 */
export function buildHousePositions(ascendantLongitude: number): HousePosition[] {
  const lagnaSignIndex = getSignIndex(ascendantLongitude)

  return Array.from({ length: HOUSES_COUNT }, (_, index) => {
    const house = index + 1
    const signIndex = (lagnaSignIndex + index) % RASHIS.length
    return {
      house,
      sign: RASHIS[signIndex],
    }
  })
}
