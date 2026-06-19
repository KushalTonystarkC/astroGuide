"use client"

import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { BirthForm } from "@/components/astrology/birth-form"
import { ChartLoadingState } from "@/components/astrology/loading-state"
import { ChartResults } from "@/components/astrology/chart-results"
import { useAuth } from "@/components/providers/auth-provider"
import { PageHeader } from "@/components/shared/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { generateKundli, getSampleKundli } from "@/lib/astrology"
import { fetchChartById, saveChartToDb } from "@/lib/charts"
import { isVedicChartData } from "@/lib/chart-display"
import { birthDetailsFromForm } from "@/types/birth"
import type { BirthDetails } from "@/types/birth"
import type { KundliChart } from "@/lib/astrology/types"
import type { BirthDetailsFormValues } from "@/lib/validations"

export function ChartPageClient() {
  const searchParams = useSearchParams()
  const chartId = searchParams.get("id")
  const isSample = searchParams.get("sample") === "true"
  const { user } = useAuth()

  const [savedChart, setSavedChart] = useState<{
    chart: KundliChart
    birthDetails: BirthDetails
  } | null>(null)
  const [loadingSaved, setLoadingSaved] = useState(Boolean(chartId))

  useEffect(() => {
    if (!chartId) {
      if (isSample) {
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
      return
    }

    let cancelled = false
    setLoadingSaved(true)

    fetchChartById(chartId)
      .then((existing) => {
        if (cancelled) return
        if (existing && !isVedicChartData(existing.chartData)) {
          setSavedChart({
            chart: existing.chartData,
            birthDetails: existing.birthDetails,
          })
        } else if (existing) {
          toast.error("This chart uses the new format — open it from Chart History")
        } else {
          toast.error("Chart not found")
        }
      })
      .catch((error: Error) => {
        if (!cancelled) toast.error(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingSaved(false)
      })

    return () => {
      cancelled = true
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
    onSuccess: async ({ chart, birthDetails }) => {
      setSavedChart({ chart, birthDetails })

      if (user) {
        try {
          await saveChartToDb(birthDetails, chart)
          toast.success("Kundli generated and saved to your account")
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to save chart"
          )
        }
      } else {
        toast.success("Kundli generated", {
          description: (
            <>
              <Link href="/login" className="underline">
                Sign in
              </Link>{" "}
              to save charts to your account.
            </>
          ),
        })
      }
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

      {loadingSaved && <ChartLoadingState />}

      {!showResults && !loadingSaved && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Birth Details</CardTitle>
            <CardDescription>
              Accurate birth time and place improve chart precision. Requires
              Swiss Ephemeris configuration on the server for live charts.
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

      {showResults && !isGenerating && !loadingSaved && savedChart && (
        <ChartResults
          chart={savedChart.chart}
          birthDetails={savedChart.birthDetails}
        />
      )}

      {showResults && !isGenerating && !loadingSaved && (
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
