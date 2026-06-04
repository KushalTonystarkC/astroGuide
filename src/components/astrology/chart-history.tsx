"use client"

import { Calendar, MapPin, Trash2, User } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SavedChart } from "@/types/birth"

interface ChartHistoryProps {
  charts: SavedChart[]
  onDelete: (id: string) => void
}

export function ChartHistory({ charts, onDelete }: ChartHistoryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {charts.map((saved) => (
        <Card key={saved.id} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="size-4 text-muted-foreground" aria-hidden="true" />
                  {saved.birthDetails.name}
                </CardTitle>
                <CardDescription className="mt-1 flex items-center gap-1">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  {new Date(saved.createdAt).toLocaleString()}
                </CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete chart for ${saved.birthDetails.name}`}
                    />
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this chart?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the saved chart for{" "}
                      {saved.birthDetails.name} from your local history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(saved.id)}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {saved.birthDetails.place}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                Lagna: {saved.chartData.lagna}
              </Badge>
              <Badge variant="outline">
                Moon: {saved.chartData.moonSign}
              </Badge>
              <Badge variant="outline">
                {saved.chartData.nakshatra.name} P
                {saved.chartData.nakshatra.pada}
              </Badge>
            </div>
            <ButtonLink
              href={`/chart?id=${saved.id}`}
              variant="outline"
              size="sm"
              className="w-full"
            >
              View Details
            </ButtonLink>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
