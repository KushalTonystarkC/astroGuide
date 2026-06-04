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

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const

export const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const

export const PLANET_NAMES = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Venus",
  "Jupiter",
  "Saturn",
] as const

export const SAMPLE_CHART = {
  ascendant: "Scorpio",
  moonSign: "Taurus",
  sunSign: "Leo",
  nakshatra: "Rohini",
  planets: [
    { name: "Sun", sign: "Leo" },
    { name: "Moon", sign: "Taurus" },
    { name: "Mars", sign: "Virgo" },
    { name: "Mercury", sign: "Leo" },
    { name: "Venus", sign: "Cancer" },
    { name: "Jupiter", sign: "Sagittarius" },
    { name: "Saturn", sign: "Aquarius" },
  ],
} as const

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
