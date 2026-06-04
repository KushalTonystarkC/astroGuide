export class AstrologyError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "AstrologyError"
    this.code = code
  }
}

export class ValidationError extends AstrologyError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class GeocodingError extends AstrologyError {
  constructor(message: string) {
    super(message, "GEOCODING_ERROR")
    this.name = "GeocodingError"
  }
}

export class AstrologyProviderError extends AstrologyError {
  constructor(message: string) {
    super(message, "ASTROLOGY_PROVIDER_ERROR")
    this.name = "AstrologyProviderError"
  }
}

export class AstrologyProviderNotConfiguredError extends AstrologyProviderError {
  constructor(providerName: string) {
    super(
      `${providerName} is not configured. Set the required environment variables or inject a SwissEphemerisAdapter.`
    )
    this.name = "AstrologyProviderNotConfiguredError"
  }
}

export function isAstrologyError(error: unknown): error is AstrologyError {
  return error instanceof AstrologyError
}

export function getErrorStatusCode(error: AstrologyError): number {
  switch (error.code) {
    case "VALIDATION_ERROR":
      return 400
    case "GEOCODING_ERROR":
      return 422
    case "ASTROLOGY_PROVIDER_ERROR":
      return 503
    default:
      return 500
  }
}
