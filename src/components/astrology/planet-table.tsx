import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPlanetInfo } from "@/lib/astrology"
import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import type { PlanetPosition } from "@/lib/astrology/types"

interface PlanetTableProps {
  planets: PlanetPosition[]
}

export function PlanetTable({ planets }: PlanetTableProps) {
  return (
    <section aria-labelledby="planet-positions-heading">
      <h2 id="planet-positions-heading" className="mb-4 text-xl font-semibold">
        Planet Positions
      </h2>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Planet</TableHead>
              <TableHead>Sign (Rashi)</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>House</TableHead>
              <TableHead className="hidden sm:table-cell">Nature</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planets.map((planet) => {
              const info = getPlanetInfo(planet.planet)
              return (
                <TableRow key={planet.planet}>
                  <TableCell className="font-medium">
                    <span className="mr-2 text-muted-foreground">
                      {info?.symbol ?? "•"}
                    </span>
                    {planet.planet}
                  </TableCell>
                  <TableCell>
                    {planet.sign}
                    <span className="ml-1 text-muted-foreground">
                      ({getRashiEnglishName(planet.sign)})
                    </span>
                  </TableCell>
                  <TableCell>{planet.degree.toFixed(2)}°</TableCell>
                  <TableCell>{planet.house}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {info?.nature ?? "—"}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
