import { z } from "zod"

export const birthDetailsSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  birthDate: z
    .string()
    .min(1, "Birth date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Please enter a valid date",
    })
    .refine((value) => new Date(value) <= new Date(), {
      message: "Birth date cannot be in the future",
    }),
  birthTime: z
    .string()
    .min(1, "Birth time is required")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time (HH:MM)"),
  birthPlace: z
    .string()
    .min(1, "Birth place is required")
    .max(200, "Birth place must be 200 characters or less"),
})

export type BirthDetailsFormValues = z.infer<typeof birthDetailsSchema>

export const astrologyApiRequestSchema = birthDetailsSchema
