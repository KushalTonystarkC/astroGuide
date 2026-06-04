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
import { fetchChartFromApi, getSampleChart } from "@/lib/astrology"
import { getChartById, saveChart } from "@/lib/local-storage"
import type { AstrologyChart, BirthDetails } from "@/types/astrology"
import type { BirthDetailsFormValues } from "@/lib/validations"

export function ChartPageClient() {
  const searchParams = useSearchParams()
  const chartId = searchParams.get("id")
  const isSample = searchParams.get("sample") === "true"

  const [savedChart, setSavedChart] = useState<{
    chart: AstrologyChart
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
        chart: getSampleChart(),
        birthDetails: {
          name: "Sample Seeker",
          birthDate: "1990-08-15",
          birthTime: "14:30",
          birthPlace: "Mumbai, India",
        },
      })
    }
  }, [chartId, isSample])

  const mutation = useMutation({
    mutationFn: fetchChartFromApi,
    onSuccess: (chart, variables) => {
      saveChart(variables, chart)
      setSavedChart({ chart, birthDetails: variables })
      toast.success("Birth chart generated and saved locally")
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
        description="Enter your birth details to receive a Vedic astrology chart with planetary positions and interpretations."
      />

      {!showResults && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Birth Details</CardTitle>
            <CardDescription>
              Accurate birth time and place improve chart precision. All data stays
              in your browser.
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
