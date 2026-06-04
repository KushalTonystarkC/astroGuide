import { NextResponse } from "next/server"

import {
  getErrorStatusCode,
  isAstrologyError,
} from "@/lib/astrology/errors"
import { generateKundliServer } from "@/lib/astrology/server"
import { parseKundliRequest } from "@/lib/astrology/validation"

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const birthDetails = parseKundliRequest(body)
    const chart = await generateKundliServer(birthDetails)

    return NextResponse.json(chart)
  } catch (error) {
    if (isAstrologyError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: getErrorStatusCode(error) }
      )
    }

    console.error("[api/kundli]", error)
    return NextResponse.json(
      { error: "Failed to generate Kundli chart", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
