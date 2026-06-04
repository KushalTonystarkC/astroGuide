# AstroGuide — Vedic Astrology MVP

A production-quality MVP for Vedic astrology chart generation built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- Birth details form with React Hook Form + Zod validation
- Mock astrology engine (deterministic, API-ready architecture)
- Birth chart summary, planet positions table, sign interpretations
- Local storage for saved charts
- Chart history with delete support
- Dark mode, responsive layout, accessible UI

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **React Hook Form** + **Zod**
- **TanStack Query**
- **Lucide React**
- **next-themes**

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Routes & API
├── components/
│   ├── astrology/          # Chart-specific UI
│   ├── layout/             # Navbar, footer
│   └── shared/             # Reusable primitives
├── data/                   # signs, nakshatras, planets JSON
├── lib/                    # Engine, storage, validation
└── types/                  # TypeScript interfaces
```

## API

`POST /api/astrology`

Request body:

```json
{
  "name": "string",
  "birthDate": "YYYY-MM-DD",
  "birthTime": "HH:MM",
  "birthPlace": "string"
}
```

Simulates 1000ms network delay and returns mock chart data.

## Replacing the Mock Engine

1. Implement your provider in `src/lib/astrology.ts` (or a new `src/lib/providers/` module).
2. Update `src/app/api/astrology/route.ts` to call the real provider.
3. Keep response shape aligned with `AstrologyChart` in `src/types/astrology.ts`.

## shadcn Components Installed

- button, card, form, input, label, table, skeleton, sheet, separator, badge, alert-dialog, sonner

To add more:

```bash
npx shadcn@latest add [component]
```

## npm Packages

**Runtime:** next, react, react-dom, react-hook-form, zod, @hookform/resolvers, @tanstack/react-query, lucide-react, class-variance-authority, clsx, tailwind-merge, next-themes, @radix-ui/react-label, @radix-ui/react-slot

**Dev:** typescript, tailwindcss, eslint, eslint-config-next

## Scripts

| Command        | Description          |
|----------------|----------------------|
| `npm run dev`  | Start dev server     |
| `npm run build`| Production build     |
| `npm run start`| Start production     |
| `npm run lint` | Run ESLint           |

## Routes

| Path       | Description                |
|------------|----------------------------|
| `/`        | Landing page               |
| `/chart`   | Generate & view charts     |
| `/history` | Saved charts (localStorage)|
| `/chart?sample=true` | Sample report   |
| `/chart?id={uuid}`   | View saved chart |

## License

Private MVP — for demonstration purposes.
