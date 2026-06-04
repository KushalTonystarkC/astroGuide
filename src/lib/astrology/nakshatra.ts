import { NAKSHATRAS, type NakshatraName } from "@/data/nakshatras"
import {
  getNakshatraFromLongitude,
  getNakshatraIndex,
} from "@/lib/astrology/calculations"
import type { NakshatraInfo } from "@/lib/astrology/types"

export { NAKSHATRAS, type NakshatraName }

export function getMoonNakshatra(moonLongitude: number): NakshatraInfo {
  return getNakshatraFromLongitude(moonLongitude)
}

export function getNakshatraName(longitude: number): NakshatraName {
  return NAKSHATRAS[getNakshatraIndex(longitude)]
}

export { getNakshatraFromLongitude, getNakshatraIndex }
