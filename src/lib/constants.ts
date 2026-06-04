export const APP_NAME = "AstroGuide"

export const STORAGE_KEY = "astroguide-charts"

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/chart", label: "Generate Chart" },
  { href: "/history", label: "History" },
] as const

export const FOOTER_LINKS = [
  { href: "#about", label: "About" },
  { href: "#privacy", label: "Privacy" },
  { href: "#terms", label: "Terms" },
] as const

export { RASHIS as ZODIAC_SIGNS } from "@/data/zodiac-signs"
export { NAKSHATRAS } from "@/data/nakshatras"
export { GRAHAS as PLANET_NAMES } from "@/data/planets"

export const FEATURE_CARDS = [
  {
    title: "Ascendant (Lagna)",
    description:
      "Your rising sign shapes first impressions, physical vitality, and how you meet the world.",
    icon: "Sunrise",
  },
  {
    title: "Moon Sign (Rashi)",
    description:
      "The Moon sign reveals your emotional nature, instincts, and inner psychological landscape.",
    icon: "Moon",
  },
  {
    title: "Nakshatra",
    description:
      "Your birth star offers deeper personality insights rooted in Vedic lunar mansions.",
    icon: "Star",
  },
  {
    title: "Planet Positions",
    description:
      "See where each graha sits in the zodiac to understand karmic influences and life themes.",
    icon: "Orbit",
  },
] as const
