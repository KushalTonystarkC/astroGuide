import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import type { HousePosition } from "@/lib/astrology/types"

interface HouseTableProps {
  houses: HousePosition[]
}

export function HouseTable({ houses }: HouseTableProps) {
  return (
    <section aria-labelledby="house-positions-heading">
      <h2 id="house-positions-heading" className="mb-4 text-xl font-semibold">
        House Positions
      </h2>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>House</TableHead>
              <TableHead>Sign (Rashi)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {houses.map((house) => (
              <TableRow key={house.house}>
                <TableCell className="font-medium">{house.house}</TableCell>
                <TableCell>
                  {house.sign}
                  <span className="ml-1 text-muted-foreground">
                    ({getRashiEnglishName(house.sign)})
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
