import { isSwissEphemerisEnabled } from "@/lib/astrology/ephemeris-config"
import {
  getRegisteredAdapter,
  setSwissEphemerisAdapter,
} from "@/lib/astrology/providers/astrology/swiss-ephemeris"

let registrationPromise: Promise<void> | null = null

/**
 * Registers the Swiss Ephemeris adapter (idempotent).
 * Called from instrumentation and lazily before the first /api/kundli request.
 */
export async function registerSwissEphemeris(): Promise<void> {
  if (getRegisteredAdapter()) return

  const { createSwephAdapter } = await import(
    "@/lib/astrology/providers/astrology/swiss-ephemeris-sweph.adapter"
  )
  setSwissEphemerisAdapter(createSwephAdapter())
}

/**
 * Ensures the adapter is registered when ENABLE_SWISS_EPHEMERIS is set.
 * Fixes dev/turbopack cases where instrumentation.ts does not run before API routes.
 */
export async function ensureSwissEphemerisRegistered(): Promise<void> {
  if (getRegisteredAdapter()) return
  if (!isSwissEphemerisEnabled()) return

  if (!registrationPromise) {
    registrationPromise = registerSwissEphemeris()
  }
  await registrationPromise
}
