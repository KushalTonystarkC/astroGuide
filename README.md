# AstroGuide — Vedic Astrology MVP

A production-quality Vedic Kundli application built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- Birth details form with React Hook Form + Zod validation
- Server-side Kundli generation (`POST /api/kundli`)
- Provider-based geocoding (OpenStreetMap, MapTiler, Google Maps)
- Swiss Ephemeris–ready astrology engine (adapter injection)
- Pure calculation layer for Rashi, Nakshatra, Pada, and houses
- Birth chart summary, planet/house tables, sign interpretations
- Local storage for saved charts
- Dark mode, responsive layout

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **React Hook Form** + **Zod**
- **TanStack Query**

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Use **View Sample Report** for a static UI preview. Live chart generation requires a Swiss Ephemeris adapter (see below).

## Project Structure

```
src/
├── app/api/kundli/          # Kundli API route
├── components/astrology/    # Chart UI (no calculations)
├── data/                    # Rashis, Nakshatras, Grahas datasets
├── lib/astrology/           # Domain engine
│   ├── calculations.ts      # Pure functions
│   ├── chart.ts             # assembleKundliChart()
│   ├── geocoding.ts         # Geocoder factory
│   ├── providers/           # Geocoding & ephemeris providers
│   ├── dasha.ts             # Future: Vimshottari (interfaces)
│   ├── transits.ts          # Future: transits (interfaces)
│   └── compatibility.ts     # Future: match making (interfaces)
└── types/                   # App-level type exports
```

## API

`POST /api/kundli`

```json
{
  "date": "1990-08-15",
  "time": "14:30",
  "place": "Bangalore, India"
}
```

Response: `KundliChart` with `lagna`, `moonSign`, `nakshatra`, `planets`, `houses`.

## Swiss Ephemeris ([aloistr/swisseph](https://github.com/aloistr/swisseph))

| Piece | What it is |
|-------|------------|
| [aloistr/swisseph](https://github.com/aloistr/swisseph) | Official **C library** + `.se1` ephemeris data (Astrodienst) |
| [`sweph`](https://www.npmjs.com/package/sweph) npm | **Node bindings** to that same C API (used by this app) |
| `SWEPH_EPHE_PATH` | Folder with `sepl_*.se1`, `semo_*.se1`, `seas_*.se1` from the repo’s [`ephe/`](https://github.com/aloistr/swisseph/tree/master/ephe) directory |

You do **not** `npm install` the GitHub repo directly. You install `sweph` and point it at ephemeris files from `aloistr/swisseph`.

### Enable live Kundli

```bash
npm install sweph
npm run setup:ephemeris   # downloads sepl_18, semo_18, seas_18 from GitHub
```

`.env.local`:

```env
ENABLE_SWISS_EPHEMERIS=true
SWEPH_EPHE_PATH=./ephemeris
ASTROLOGY_PROVIDER=swiss-ephemeris
```

Restart `npm run dev`.

### Custom adapter (optional)

1. Install a maintained Swiss Ephemeris binding.
2. Implement `SwissEphemerisAdapter` in `src/lib/astrology/types.ts`:

```typescript
import { setSwissEphemerisAdapter } from "@/lib/astrology"

setSwissEphemerisAdapter({
  async calculateSiderealChart({ julianDayUt, latitude, longitude, ayanamsa }) {
    // Return sidereal longitudes + ascendant
    return {
      ascendantLongitude: /* degrees 0-360 */,
      positions: [
        { planet: "Sun", longitude: 0 },
        { planet: "Moon", longitude: 0 },
        // ... Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
      ],
    }
  },
})
```

3. Register at app startup (e.g. `instrumentation.ts` or server init).

All sign/nakshatra/house mapping flows through `assembleKundliChart()` — no changes needed in UI or API.

## Frontend Service

```typescript
import { generateKundli } from "@/lib/astrology"

const chart = await generateKundli({ date, time, place })
```

React components never perform astrology calculations.

## Environment Variables

See `.env.example` for geocoding and provider configuration.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
