import { NextResponse } from "next/server"

import {
  getErrorStatusCode,
  isAstrologyError,
} from "@/lib/astrology/errors"
import { searchPlaces } from "@/lib/astrology/geocoding"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim() ?? ""

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await searchPlaces(query, 5)

    return NextResponse.json({ suggestions })
  } catch (error) {
    if (isAstrologyError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: getErrorStatusCode(error) }
      )
    }

    console.error("[api/geocode]", error)
    return NextResponse.json(
      { error: "Failed to search locations", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
