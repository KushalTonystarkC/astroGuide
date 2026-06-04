import { ValidationError } from "@/lib/astrology/errors"

/**
 * Converts local birth date/time in IANA timezone to Julian Day (UT).
 * Used by ephemeris providers — pure date math, no ephemeris dependency.
 */

export function parseBirthDateTime(
  date: string,
  time: string,
  timezone: string
): Date {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time)

  if (!dateMatch || !timeMatch) {
    throw new ValidationError("Invalid date or time format")
  }

  const year = Number(dateMatch[1])
  const month = Number(dateMatch[2])
  const day = Number(dateMatch[3])
  const hour = Number(timeMatch[1])
  const minute = Number(timeMatch[2])

  if (!isValidCalendarDate(year, month, day)) {
    throw new ValidationError("Invalid birth date")
  }

  const utcMs = zonedTimeToUtcMs(
    { year, month, day, hour, minute },
    timezone
  )

  return new Date(utcMs)
}

export function toJulianDayUt(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) return false
  const daysInMonth = new Date(year, month, 0).getDate()
  return day <= daysInMonth
}

interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

function zonedTimeToUtcMs(parts: ZonedParts, timezone: string): number {
  const guess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    0,
    0
  )

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })

  const offsetMs = getTimezoneOffsetMs(guess, formatter)
  return guess - offsetMs
}

function getTimezoneOffsetMs(
  utcMs: number,
  formatter: Intl.DateTimeFormat
): number {
  const parts = formatter.formatToParts(new Date(utcMs))
  const values: Record<string, string> = {}
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value
    }
  }

  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second ?? 0)
  )

  return asUtc - utcMs
}
