import { NextResponse } from "next/server"

import {
  getErrorStatusCode,
  isAstrologyError,
} from "@/lib/astrology/errors"
import { geocodePlace, searchPlaces } from "@/lib/astrology/geocoding"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    const resolve = searchParams.get("resolve") === "true"

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    if (resolve) {
      const location = await geocodePlace(query)
      return NextResponse.json(location)
    }

    const suggestions = await searchPlaces(query)
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
      { error: "Failed to search places", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
