import path from "node:path"

export function isSwissEphemerisEnabled(): boolean {
  const value = process.env.ENABLE_SWISS_EPHEMERIS?.trim().toLowerCase()
  return value === "true" || value === "1"
}

/** Resolve SWEPH_EPHE_PATH relative to project root for Next.js API routes. */
export function resolveEphemerisPath(): string | undefined {
  const configured = process.env.SWEPH_EPHE_PATH?.trim()
  if (!configured) return undefined
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(process.cwd(), configured)
}
