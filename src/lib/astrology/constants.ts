import { NAKSHATRA_COUNT } from "@/data/nakshatras"
import { RASHIS } from "@/data/zodiac-signs"

export const ZODIAC_SIGN_COUNT = RASHIS.length
export const DEGREES_PER_SIGN = 30
export const DEGREES_PER_NAKSHATRA = 360 / NAKSHATRA_COUNT
export const DEGREES_PER_PADA = DEGREES_PER_NAKSHATRA / 4
export const PADAS_PER_NAKSHATRA = 4
export const HOUSES_COUNT = 12
export const FULL_CIRCLE_DEGREES = 360

export const DEFAULT_AYANAMSA: import("./types").AyanamsaType = "lahiri"
