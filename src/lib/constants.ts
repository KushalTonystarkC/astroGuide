export const APP_NAME = "AstroGuide"

export const STORAGE_KEY = "astroguide-charts"

export const NAV_LINKS = [
  { href: "/", labelKey: "nav_home" },
  { href: "/panchang", labelKey: "nav_panchang" },
  { href: "/chart", labelKey: "nav_kundali" },
  { href: "/muhurta", labelKey: "nav_muhurta" },
  { href: "/transits", labelKey: "nav_transits" },
  { href: "/history", labelKey: "nav_history" },
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
    title: "Daily Panchang",
    description:
      "Hindu almanac with tithi, nakshatra, yoga, karana, Rahu Kala, Hora, and auspicious timings.",
    icon: "Sunrise",
    href: "/panchang",
  },
  {
    title: "Kundali Birth Chart",
    description:
      "Full birth chart with divisional charts, Vimshottari Dasha, Ashtakavarga, and Jaimini analysis.",
    icon: "Star",
    href: "/chart",
  },
  {
    title: "Muhurta Finder",
    description:
      "Find auspicious dates for marriage, travel, business, and other important undertakings.",
    icon: "Moon",
    href: "/muhurta",
  },
  {
    title: "Planetary Transits",
    description:
      "Track when planets change signs, nakshatras, or go retrograde over a date range.",
    icon: "Orbit",
    href: "/transits",
  },
] as const
