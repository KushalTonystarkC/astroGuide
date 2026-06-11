export const SIGN_LORDS = [
  "Mars",
  "Venus",
  "Mercury",
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Saturn",
  "Jupiter",
] as const;

export function signForHouse(ascSign: number, house: number): number {
  return ((ascSign - 1 + (house - 1)) % 12) + 1;
}

export function lordForSign(sign: number): string {
  return SIGN_LORDS[sign - 1];
}

export function houseLord(ascSign: number, house: number): string {
  return lordForSign(signForHouse(ascSign, house));
}
