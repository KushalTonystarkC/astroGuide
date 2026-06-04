import {
  ENGLISH_TO_RASHI,
  RASHI_ABBREVIATIONS,
  RASHI_ENGLISH_NAMES,
  RASHIS,
  type RashiName,
} from "@/data/zodiac-signs"
import { getSignFromLongitude, getSignIndex } from "@/lib/astrology/calculations"

export { RASHIS, RASHI_ENGLISH_NAMES, type RashiName }

export function getRashiEnglishName(rashi: string): string {
  return RASHI_ENGLISH_NAMES[rashi as RashiName] ?? rashi
}

export function toRashiName(sign: string): RashiName | null {
  if (RASHIS.includes(sign as RashiName)) {
    return sign as RashiName
  }
  return ENGLISH_TO_RASHI[sign] ?? null
}

export function getRashiAbbreviation(rashi: string): string {
  return RASHI_ABBREVIATIONS[rashi as RashiName] ?? rashi.slice(0, 3)
}

export function getRashiIndex(rashi: string): number {
  const resolved = toRashiName(rashi)
  if (!resolved) return 0
  return RASHIS.indexOf(resolved)
}

export { getSignFromLongitude, getSignIndex }
