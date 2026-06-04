import { z } from "zod"

import { ValidationError } from "@/lib/astrology/errors"
import type { BirthDetails } from "@/lib/astrology/types"

const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const kundliRequestSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .regex(dateRegex, "Date must be YYYY-MM-DD")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Please enter a valid date",
    })
    .refine((value) => new Date(`${value}T12:00:00`) <= new Date(), {
      message: "Birth date cannot be in the future",
    }),
  time: z
    .string()
    .min(1, "Time is required")
    .regex(timeRegex, "Time must be HH:MM (24-hour)"),
  place: z
    .string()
    .min(1, "Birth place is required")
    .max(200, "Birth place must be 200 characters or less"),
})

export type KundliRequestInput = z.infer<typeof kundliRequestSchema>

export function parseKundliRequest(body: unknown): BirthDetails {
  const parsed = kundliRequestSchema.safeParse(body)

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid request"
    throw new ValidationError(firstIssue)
  }

  return parsed.data
}
