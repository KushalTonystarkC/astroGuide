import { NextResponse } from "next/server"

import { generateMockChart } from "@/lib/astrology"
import { astrologyApiRequestSchema } from "@/lib/validations"

const MOCK_DELAY_MS = 1000

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = astrologyApiRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

    const chart = generateMockChart(parsed.data)

    return NextResponse.json(chart)
  } catch {
    return NextResponse.json(
      { error: "Failed to generate astrology chart" },
      { status: 500 }
    )
  }
}
