import { getRashiEnglishName } from "@/lib/astrology/zodiac"
import type { HousePosition } from "@/lib/astrology/types"
import { cn } from "@/lib/utils"

interface HouseTableProps {
  houses: HousePosition[]
}

export function HouseTable({ houses }: HouseTableProps) {
  return (
    <section aria-labelledby="house-positions-heading">
      <h2 id="house-positions-heading" className="mb-4 text-xl font-semibold">
        House Positions
      </h2>
      <div className="overflow-hidden rounded-xl border-2 border-primary/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th
                  scope="col"
                  className="w-1/4 px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase"
                >
                  House
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase"
                >
                  Sign (Rashi)
                </th>
              </tr>
            </thead>
            <tbody>
              {houses.map((house, index) => (
                <tr
                  key={house.house}
                  className={cn(
                    "border-b border-primary/10 transition-colors last:border-b-0",
                    index % 2 === 0 ? "bg-card" : "bg-primary/[0.04]"
                  )}
                >
                  <td className="px-4 py-3 font-bold text-primary">
                    {house.house}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {house.sign}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      ({getRashiEnglishName(house.sign)})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
