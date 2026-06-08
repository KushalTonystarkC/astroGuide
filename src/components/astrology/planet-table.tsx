import { enrichPlanetRows, getPlanetAbbreviation } from "@/lib/astrology/kundli-display"
import type { PlanetPosition } from "@/lib/astrology/types"
import { cn } from "@/lib/utils"

interface PlanetTableProps {
  planets: PlanetPosition[]
}

const COLUMNS = [
  { key: "planet", label: "Planet", className: "w-[14%]" },
  { key: "signNo", label: "Sign No", className: "w-[10%]" },
  { key: "sign", label: "Sign", className: "w-[18%]" },
  { key: "degree", label: "Degree", className: "w-[12%]" },
  { key: "nakshatra", label: "Nakshatra", className: "w-[30%]" },
  { key: "house", label: "House", className: "w-[10%]" },
] as const

export function PlanetTable({ planets }: PlanetTableProps) {
  const rows = enrichPlanetRows(planets)

  return (
    <section aria-labelledby="planet-positions-heading">
      <h2 id="planet-positions-heading" className="sr-only">
        Planet Positions
      </h2>
      <div className="overflow-hidden rounded-xl border-2 border-primary/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase",
                      col.className
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isRetrograde = row.isRetrograde ?? false
                const planetLabel = getPlanetAbbreviation(row.planet)

                return (
                  <tr
                    key={row.planet}
                    className={cn(
                      "border-b border-primary/10 transition-colors last:border-b-0",
                      index % 2 === 0 ? "bg-card" : "bg-primary/[0.04]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-[13px] font-bold",
                          isRetrograde ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {planetLabel}
                        {isRetrograde && " R"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">
                      {row.signNumber}
                    </td>
                    <td className="px-4 py-3 text-foreground/90">
                      {row.signEnglish}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.degreeRounded}°
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.nakshatraName}{" "}
                      <span className="text-muted-foreground/70">
                        ({row.nakshatraPada})
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">
                      {row.house}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
