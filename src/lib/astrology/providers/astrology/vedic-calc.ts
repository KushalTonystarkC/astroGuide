import {
  generateKundali,
  generateNorthIndianChartSVG,
  Planet,
  type PlanetData,
  type RasiChart,
} from "vedic-calc"

import { ENGLISH_TO_RASHI } from "@/data/zodiac-signs"
import { parseBirthDateTime } from "@/lib/astrology/datetime"
import type {
  AstrologyProvider,
  BirthDetails,
  HousePosition,
  KundliChart,
  Location,
  PlanetPosition,
} from "@/lib/astrology/types"

const PLANET_NAMES: Record<Planet, string> = {
  [Planet.SUN]: "Sun",
  [Planet.MOON]: "Moon",
  [Planet.MARS]: "Mars",
  [Planet.MERCURY]: "Mercury",
  [Planet.JUPITER]: "Jupiter",
  [Planet.VENUS]: "Venus",
  [Planet.SATURN]: "Saturn",
  [Planet.RAHU]: "Rahu",
  [Planet.KETU]: "Ketu",
}

function englishSignToRashi(signName: string): string {
  return ENGLISH_TO_RASHI[signName] ?? signName
}

function mapPlanet(planet: PlanetData): PlanetPosition {
  return {
    planet: PLANET_NAMES[planet.planet],
    sign: englishSignToRashi(planet.signName),
    degree: planet.degreeInSign,
    house: planet.house,
  }
}

function mapHouses(rasi: RasiChart): HousePosition[] {
  return rasi.houses.map((house) => ({
    house: house.number,
    sign: englishSignToRashi(house.signName),
  }))
}

function mapKundliChart(rasi: RasiChart, location: Location): KundliChart {
  const moon = rasi.planets.find((p) => p.planet === Planet.MOON)
  if (!moon) {
    throw new Error("Moon position is required to build a Kundli chart")
  }

  const chartSvg = generateNorthIndianChartSVG(rasi, {
    showTable: true,
    layout: "column",
    width: 450,
    height: 350,
  })

  return {
    lagna: englishSignToRashi(rasi.ascendant.signName),
    moonSign: englishSignToRashi(moon.signName),
    nakshatra: {
      name: moon.nakshatra,
      pada: moon.nakshatraPada,
    },
    planets: rasi.planets.map(mapPlanet),
    houses: mapHouses(rasi),
    chartSvg,
    location,
  }
}

export class VedicCalcProvider implements AstrologyProvider {
  async generateChart(
    birthDetails: BirthDetails,
    location: Location
  ): Promise<KundliChart> {
    const birthDate = parseBirthDateTime(
      birthDetails.date,
      birthDetails.time,
      location.timezone
    )

    const { rasi } = generateKundali(
      birthDate,
      location.latitude,
      location.longitude,
      location.timezone
    )

    return mapKundliChart(rasi, location)
  }
}
