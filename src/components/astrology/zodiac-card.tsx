import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { NakshatraInterpretation, SignInterpretation } from "@/types/astrology"

interface ZodiacCardProps {
  title: string
  value: string
  interpretation: SignInterpretation | NakshatraInterpretation | null
  type?: "sign" | "nakshatra"
}

export function ZodiacCard({
  title,
  value,
  interpretation,
  type = "sign",
}: ZodiacCardProps) {
  const isSign = type === "sign" && interpretation && "element" in interpretation

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-xl">{value}</CardTitle>
        {isSign && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">
              {(interpretation as SignInterpretation).element}
            </Badge>
            <Badge variant="outline">
              Ruler: {(interpretation as SignInterpretation).ruler}
            </Badge>
          </div>
        )}
        {!isSign && interpretation && "deity" in interpretation && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">
              Deity: {interpretation.deity}
            </Badge>
            <Badge variant="outline">Symbol: {interpretation.symbol}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {interpretation?.summary ??
            "Interpretation not available for this placement."}
        </p>
        {isSign && (interpretation as SignInterpretation).traits.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(interpretation as SignInterpretation).traits.map((trait) => (
              <Badge key={trait} variant="outline">
                {trait}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
