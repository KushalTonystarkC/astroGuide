"use client"

import { useMutation } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { BirthForm } from "@/components/astrology/birth-form"
import { ChartLoadingState } from "@/components/astrology/loading-state"
import { ChartResults } from "@/components/astrology/chart-results"
import { PageHeader } from "@/components/shared/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { generateKundli, getSampleKundli } from "@/lib/astrology"
import { getChartById, saveChart } from "@/lib/local-storage"
import { birthDetailsFromForm } from "@/types/birth"
import type { BirthDetails } from "@/types/birth"
import type { KundliChart } from "@/lib/astrology/types"
import type { BirthDetailsFormValues } from "@/lib/validations"

export function ChartPageClient() {
  const searchParams = useSearchParams()
  const chartId = searchParams.get("id")
  const isSample = searchParams.get("sample") === "true"

  const [savedChart, setSavedChart] = useState<{
    chart: KundliChart
    birthDetails: BirthDetails
  } | null>(null)

  useEffect(() => {
    if (chartId) {
      const existing = getChartById(chartId)
      if (existing) {
        setSavedChart({
          chart: existing.chartData,
          birthDetails: existing.birthDetails,
        })
      }
    } else if (isSample) {
      setSavedChart({
        chart: getSampleKundli(),
        birthDetails: {
          name: "Sample Seeker",
          date: "1990-08-15",
          time: "14:30",
          place: "Mumbai, India",
        },
      })
    }
  }, [chartId, isSample])

  const mutation = useMutation({
    mutationFn: async (values: BirthDetailsFormValues) => {
      const birthDetails = birthDetailsFromForm(values)
      const chart = await generateKundli({
        date: birthDetails.date,
        time: birthDetails.time,
        place: birthDetails.place,
      })
      return { chart, birthDetails }
    },
    onSuccess: ({ chart, birthDetails }) => {
      saveChart(birthDetails, chart)
      setSavedChart({ chart, birthDetails })
      toast.success("Kundli generated and saved locally")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = useCallback(
    (values: BirthDetailsFormValues) => {
      mutation.mutate(values)
    },
    [mutation]
  )

  const showResults = savedChart !== null
  const isGenerating = mutation.isPending

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Generate Your Chart"
        description="Enter your birth details to receive a Vedic Kundli with planetary positions and interpretations."
      />

      {!showResults && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Birth Details</CardTitle>
            <CardDescription>
              Accurate birth time and place improve chart precision. Birth place
              is geocoded via OpenStreetMap to obtain coordinates for the
              Kundli calculation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BirthForm onSubmit={handleSubmit} isLoading={isGenerating} />
          </CardContent>
        </Card>
      )}

      {isGenerating && <ChartLoadingState />}

      {mutation.isError && !isGenerating && (
        <p className="mb-6 text-sm text-destructive" role="alert">
          {mutation.error.message}
        </p>
      )}

      {showResults && !isGenerating && savedChart && (
        <ChartResults
          chart={savedChart.chart}
          birthDetails={savedChart.birthDetails}
        />
      )}

      {showResults && !isGenerating && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => {
              setSavedChart(null)
              mutation.reset()
            }}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Generate another chart
          </button>
        </div>
      )}
    </div>
  )
}
