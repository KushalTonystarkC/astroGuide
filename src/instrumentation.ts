/**
 * Next.js server bootstrap — register Swiss Ephemeris before API routes run.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { ensureSwissEphemerisRegistered } = await import(
    "@/lib/astrology/register-ephemeris"
  )
  await ensureSwissEphemerisRegistered()
}
