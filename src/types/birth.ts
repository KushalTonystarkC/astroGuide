import type { KundliChart } from "@/lib/astrology/types"
import type { BirthDetailsFormValues } from "@/lib/validations"

/** Form and storage layer — includes display name alongside Kundli API fields. */
export interface BirthDetails {
  name: string
  date: string
  time: string
  place: string
}

export interface SavedChart {
  id: string
  createdAt: string
  birthDetails: BirthDetails
  chartData: KundliChart
}

export function birthDetailsFromForm(
  values: BirthDetailsFormValues
): BirthDetails {
  return {
    name: values.name,
    date: values.birthDate,
    time: values.birthTime,
    place: values.birthPlace,
  }
}
