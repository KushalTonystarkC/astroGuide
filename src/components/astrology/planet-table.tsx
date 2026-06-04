import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPlanetInfo } from "@/lib/astrology"
import type { PlanetPosition } from "@/types/astrology"

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
              <TableHead>Sign</TableHead>
              <TableHead className="hidden sm:table-cell">Nature</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planets.map((planet) => {
              const info = getPlanetInfo(planet.name)
              return (
                <TableRow key={planet.name}>
                  <TableCell className="font-medium">
                    <span className="mr-2 text-muted-foreground">
                      {info?.symbol ?? "•"}
                    </span>
                    {planet.name}
                  </TableCell>
                  <TableCell>{planet.sign}</TableCell>
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
